import logging
import json
import re
import secrets
import uuid
from typing import Dict, List, Optional
from datetime import datetime, timezone
from langchain_core.tools import tool
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..models.agent import HITLReview
from shared_logic import get_supabase_client

logger = logging.getLogger("ai-agent.graph.chat_tools")

_PII_TOKEN_RE = re.compile(
    r"\[(?:EMAIL|PHONE|PHONE_IN|PAN|AADHAAR|GSTIN|SSN|CREDIT_CARD|IP_ADDRESS|PERSON|ORG):([a-f0-9]{8})\]"
)


def _unmask_pii(value: str, pii_map: Dict[str, str]) -> str:
    """Reverse PII masking: replace [TYPE:hash] tokens and bare hashes with originals."""
    result = _PII_TOKEN_RE.sub(
        lambda m: pii_map.get(m.group(1), m.group(0)),
        value,
    )
    if result == value:
        stripped = value.strip()
        if stripped in pii_map:
            return pii_map[stripped]
    return result


def build_chat_tools(db: Session, organization_id: str, user_id: str, pii_unmask_map: Optional[Dict[str, str]] = None) -> List:
    """Build toolset injected with request context for the Chatbot Agent.

    Args:
        pii_unmask_map: hash_token -> original_value mapping from PIIMasker,
                        used to reverse PII masking in HITL tool inputs.
    """
    _pii_map = pii_unmask_map or {}

    @tool
    def get_compliance_reports() -> str:
        """Fetch the compliance and emission reports for the organization."""
        try:
            result = db.execute(
                text("SELECT id, report_year, scope_type, calculated_tco2e, status FROM emission_reports WHERE organization_id = :org_id"),
                {"org_id": organization_id}
            ).mappings().all()
            if not result:
                return "No compliance reports found for this organization."
            return str([dict(r) for r in result])
        except Exception as e:
            return f"Failed to fetch reports: {e}"

    @tool
    def get_organization_users() -> str:
        """Fetch all users belonging to the organization."""
        try:
            query = """
                SELECT p.id, u.email, p.full_name, string_agg(r.name, ',') as roles
                FROM profiles p
                JOIN auth.users u ON p.id = u.id
                LEFT JOIN user_roles ur ON p.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE ur.organization_id = :org_id
                GROUP BY p.id, u.email, p.full_name
            """
            result = db.execute(
                text(query),
                {"org_id": organization_id}
            ).mappings().all()
            if not result:
                return "No users found for this organization."
            return str([dict(r) for r in result])
        except Exception as e:
            return f"Failed to fetch users: {e}"

    @tool
    def get_organization_details() -> str:
        """Fetch the organization profile details including company names and registration info."""
        try:
            result = db.execute(
                text("SELECT id, legal_name, trade_name, industry_sector, registration_number, headquarters_address FROM organizations WHERE id = :org_id"),
                {"org_id": organization_id}
            ).mappings().first()
            if not result:
                return "No organization details found."
            return str(dict(result))
        except Exception as e:
            return f"Failed to fetch organization details: {e}"

    @tool
    def get_available_roles() -> str:
        """Fetch all available roles in the system with their descriptions/permissions."""
        try:
            result = db.execute(
                text("SELECT id, name, permissions FROM roles")
            ).mappings().all()
            if not result:
                return "No roles found."
            return str([dict(r) for r in result])
        except Exception as e:
            return f"Failed to fetch roles: {e}"

    @tool
    def create_new_user(email: str, full_name: str, role_id: str) -> str:
        """Create a new user and assign a role (by role ID). Requires Human-in-the-Loop approval."""
        try:
            role = db.execute(
                text("SELECT id, name FROM roles WHERE id = :role_id"),
                {"role_id": role_id}
            ).mappings().first()
            if not role:
                return f"Error: Role ID '{role_id}' does not exist in the system. Use get_available_roles tool to find valid roles first."

            real_email = _unmask_pii(email, _pii_map)
            real_full_name = _unmask_pii(full_name, _pii_map)

            suggestion_data = {
                "action": "create_user",
                "email": real_email,
                "full_name": real_full_name,
                "role_id": role_id,
                "role_name": role["name"],
                "requested_at": datetime.now(timezone.utc).isoformat(),
                "requested_by": user_id,
            }
            
            review = HITLReview(
                organization_id=organization_id,
                issue_detected="User creation request via AI Agent",
                ai_suggestion=json.dumps(suggestion_data),
                human_decision="PENDING"
            )
            db.add(review)
            db.commit()
            return f"Action requires human approval. Request logged with HITL ID {review.id}."
        except Exception as e:
            db.rollback()
            return f"Failed to log user creation request: {e}"

    @tool
    def execute_sql_query(query: str, action: str) -> str:
        """Execute an UPDATE or DELETE SQL query on the database. Requires Human-in-the-Loop approval."""
        if action.upper() not in ["UPDATE", "DELETE", "INSERT"]:
            return "Only UPDATE, DELETE, and INSERT actions must be routed here."
            
        try:
            suggestion_data = {
                "action": "execute_sql",
                "query": query,
                "sql_action": action.upper(),
                "requested_at": datetime.now(timezone.utc).isoformat(),
                "requested_by": user_id,
            }
            review = HITLReview(
                organization_id=organization_id,
                issue_detected=f"Database {action.upper()} request via AI Agent",
                ai_suggestion=json.dumps(suggestion_data),
                human_decision="PENDING"
            )
            db.add(review)
            db.commit()
            return f"Database mutation requires human approval. Request logged with HITL ID {review.id}."
        except Exception as e:
            db.rollback()
            return f"Failed to log SQL mutation request: {e}"

    @tool
    def approve_hitl_review(hitl_id: str) -> str:
        """Approve and execute a pending HITL review request by its ID."""
        try:
            review = db.query(HITLReview).filter(HITLReview.id == hitl_id).first()
            if not review:
                return f"HITL review with ID {hitl_id} not found."
            if review.human_decision != "PENDING":
                return f"HITL review with ID {hitl_id} has already been resolved with decision: {review.human_decision}."
            
            # Parse the suggestion
            suggestion = review.ai_suggestion
            if not suggestion:
                # Mark as approved anyway
                review.human_decision = "APPROVED"
                if user_id:
                    review.reviewer_id = uuid.UUID(user_id)
                review.reviewed_at = datetime.now(timezone.utc)
                db.commit()
                return f"Review {hitl_id} marked as APPROVED, but no action suggestion was found to execute."

            # Attempt to parse as JSON
            data = None
            try:
                data = json.loads(suggestion)
            except Exception:
                # Fallback parsing for legacy text format
                import re
                if suggestion.startswith("Create user"):
                    # Legacy: "Create user email (fullname) with roles roles"
                    match = re.search(r"Create user (\S+) \((.*?)\) with roles? (\S+)", suggestion)
                    if match:
                        data = {
                            "action": "create_user",
                            "email": match.group(1),
                            "full_name": match.group(2),
                            "role_id": match.group(3)
                        }
                elif "Execute query:" in suggestion:
                    data = {
                        "action": "execute_sql",
                        "query": suggestion.replace("Execute query:", "").strip(),
                        "sql_action": "MUTATION"
                    }

            if not data or not isinstance(data, dict):
                # Mark as approved and return
                review.human_decision = "APPROVED"
                if user_id:
                    review.reviewer_id = uuid.UUID(user_id)
                review.reviewed_at = datetime.now(timezone.utc)
                db.commit()
                return f"Review {hitl_id} marked as APPROVED, but failed to parse action suggestion: {suggestion}."

            action = data.get("action")
            if action == "create_user":
                email = data.get("email")
                full_name = data.get("full_name")
                role_id = data.get("role_id")
                
                # Check if role_id is valid uuid
                try:
                    uuid.UUID(role_id)
                except ValueError:
                    # Look up role ID by name if legacy name was stored
                    role_row = db.execute(
                        text("SELECT id FROM roles WHERE name = :role_name"),
                        {"role_name": role_id}
                    ).mappings().first()
                    if role_row:
                        role_id = str(role_row["id"])
                    else:
                        # Assign default role ORG_VIEWER if role name not found
                        default_role_row = db.execute(
                            text("SELECT id FROM roles WHERE name = 'ORG_VIEWER'")
                        ).mappings().first()
                        if default_role_row:
                            role_id = str(default_role_row["id"])
                        else:
                            return f"Failed to execute user creation: Role ID or name '{role_id}' is invalid."

                # Execute Supabase auth registration
                exec_msg = _execute_user_creation(db, email, full_name, role_id, organization_id)
                if "Successfully" in exec_msg:
                    review.human_decision = "APPROVED"
                    if user_id:
                        review.reviewer_id = uuid.UUID(user_id)
                    review.reviewed_at = datetime.now(timezone.utc)
                    db.commit()
                else:
                    db.rollback()
                return exec_msg

            elif action == "execute_sql":
                query = data.get("query")
                sql_action = data.get("sql_action", "MUTATION")
                try:
                    result = db.execute(text(query))
                    review.human_decision = "APPROVED"
                    if user_id:
                        review.reviewer_id = uuid.UUID(user_id)
                    review.reviewed_at = datetime.now(timezone.utc)
                    db.commit()
                    return f"Successfully executed SQL {sql_action} query. Rows affected: {result.rowcount}."
                except Exception as db_exc:
                    db.rollback()
                    return f"Failed to execute SQL query: {db_exc}"
            
            else:
                review.human_decision = "APPROVED"
                if user_id:
                    review.reviewer_id = uuid.UUID(user_id)
                review.reviewed_at = datetime.now(timezone.utc)
                db.commit()
                return f"Review {hitl_id} marked as APPROVED, but action type '{action}' is unrecognised."

        except Exception as e:
            db.rollback()
            return f"Failed to resolve HITL review: {e}"

    def _execute_user_creation(db: Session, email: str, full_name: str, role_id: str, organization_id: str) -> str:
        # 1. Check if user already exists in profiles or auth
        existing_profile = db.execute(
            text("SELECT p.id FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = :email"),
            {"email": email}
        ).mappings().first()
        if existing_profile:
            return f"User with email '{email}' already exists."

        # 2. Create the user in Supabase auth admin
        try:
            supabase_admin = get_supabase_client(use_service_role=True)
            password = secrets.token_urlsafe(12) + "aB1!"
            
            res = supabase_admin.auth.admin.create_user(
                {
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": full_name,
                        "is_active": True,
                        "email_verified": True,
                    },
                }
            )
            user = res.user
            if not user:
                return "Failed to create user in Supabase."
        except Exception as e:
            return f"Failed to create user in Supabase: {e}"

        # 3. Create profile and assign role in postgres
        try:
            user_uuid = str(user.id)
            db.execute(
                text("""
                    INSERT INTO profiles (id, full_name, is_active, created_at)
                    VALUES (:id, :full_name, true, now())
                    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true
                """),
                {"id": user_uuid, "full_name": full_name}
            )
            
            db.execute(
                text("""
                    INSERT INTO user_roles (id, user_id, role_id, organization_id)
                    VALUES (:id, :user_id, :role_id, :org_id)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user_uuid,
                    "role_id": role_id,
                    "org_id": organization_id
                }
            )
            db.commit()
            return f"Successfully created user {email} ({full_name}) and assigned role ID {role_id} under organization {organization_id}."
        except Exception as e:
            db.rollback()
            try:
                supabase_admin.auth.admin.delete_user(str(user.id))
            except Exception as delete_exc:
                logger.error(f"Failed to clean up Supabase user {user.id} after DB error: {delete_exc}")
            return f"Failed to persist user in database: {e}"

    return [
        get_compliance_reports,
        get_organization_users,
        get_organization_details,
        get_available_roles,
        create_new_user,
        execute_sql_query,
        approve_hitl_review
    ]
