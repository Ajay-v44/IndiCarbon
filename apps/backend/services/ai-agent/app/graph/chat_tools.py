import logging
from typing import List
from langchain_core.tools import tool
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..models.agent import HITLReview

logger = logging.getLogger("ai-agent.graph.chat_tools")

def build_chat_tools(db: Session, organization_id: str, user_id: str) -> List:
    """Build toolset injected with request context for the Chatbot Agent."""

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
            result = db.execute(
                text("SELECT id, email, full_name, roles FROM users WHERE organization_id = :org_id"),
                {"org_id": organization_id}
            ).mappings().all()
            if not result:
                return "No users found for this organization."
            return str([dict(r) for r in result])
        except Exception as e:
            return f"Failed to fetch users: {e}"

    @tool
    def create_new_user(email: str, full_name: str, roles: List[str]) -> str:
        """Create a new user and assign roles. Requires Human-in-the-Loop approval."""
        review = HITLReview(
            organization_id=organization_id,
            issue_detected="User creation request via AI Agent",
            ai_suggestion=f"Create user {email} ({full_name}) with roles {roles}",
            human_decision="PENDING"
        )
        db.add(review)
        db.commit()
        return f"Action requires human approval. Request logged with HITL ID {review.id}."

    @tool
    def execute_sql_query(query: str, action: str) -> str:
        """Execute an UPDATE or DELETE SQL query on the database. Requires Human-in-the-Loop approval."""
        if action.upper() not in ["UPDATE", "DELETE", "INSERT"]:
            return "Only UPDATE, DELETE, and INSERT actions must be routed here."
            
        review = HITLReview(
            organization_id=organization_id,
            issue_detected=f"Database {action.upper()} request via AI Agent",
            ai_suggestion=f"Execute query: {query}",
            human_decision="PENDING"
        )
        db.add(review)
        db.commit()
        return f"Database mutation requires human approval. Request logged with HITL ID {review.id}."

    return [get_compliance_reports, get_organization_users, create_new_user, execute_sql_query]
