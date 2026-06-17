"""
Authentication & user management tools.

Gateway routes:
  POST /api/v1/auth/login
  POST /api/v1/auth/register
  POST /api/v1/auth/refresh
  GET  /api/v1/users/me
  GET  /api/v1/users
  GET  /api/v1/auth/roles
  POST /api/v1/auth/roles
  POST /api/v1/auth/roles/assign
"""

from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from .. import client


def register(mcp: FastMCP) -> None:

    @mcp.tool()
    def indicarbon_login(email: str, password: str) -> str:
        """
        Authenticate with IndiCarbon and store the session token.
        Must be called before any protected operation.

        Returns the access token, user ID, roles, and expiry information.
        """
        data = client.login(email, password)
        return json.dumps({
            "status": "authenticated",
            "user_id": str(data.get("user_id")),
            "email": data.get("email"),
            "roles": data.get("roles", []),
            "is_internal": data.get("is_internal", False),
            "expires_in": data.get("expires_in"),
            "access_token": data.get("access_token"),
        }, indent=2)

    @mcp.tool()
    def indicarbon_register(
        email: str,
        password: str,
        full_name: str,
        phone_number: str | None = None,
        designation: str | None = None,
    ) -> str:
        """
        Register a new IndiCarbon user account.
        Password must be at least 8 characters.

        Returns the new user's token information (auto-logs in after registration).
        """
        payload: dict[str, Any] = {
            "email": email,
            "password": password,
            "full_name": full_name,
        }
        if phone_number:
            payload["phone_number"] = phone_number
        if designation:
            payload["designation"] = designation

        # Registration does not require auth
        with __import__("httpx").Client(base_url=__import__("indicarbon_mcp.config", fromlist=["settings"]).settings.gateway_url) as c:
            resp = c.post("/api/v1/auth/register", json=payload)
        resp.raise_for_status()
        data = resp.json().get("data") or resp.json()
        # Store token from registration
        client.set_tokens(data["access_token"], data["refresh_token"])
        return json.dumps({
            "status": "registered",
            "user_id": str(data.get("user_id")),
            "email": data.get("email"),
            "roles": data.get("roles", []),
            "access_token": data.get("access_token"),
        }, indent=2)

    @mcp.tool()
    def indicarbon_get_profile() -> str:
        """
        Get the authenticated user's profile (roles, organization memberships, etc).
        """
        data = client.get("/api/v1/users/me")
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_users(limit: int = 50, offset: int = 0) -> str:
        """
        List all users visible to the current session (admin view).

        Args:
            limit: Maximum users to return (1-200, default 50).
            offset: Pagination offset (default 0).
        """
        data = client.get("/api/v1/users", params={"limit": limit, "offset": offset})
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_roles(exclude_internal: bool = False) -> str:
        """
        List available RBAC roles in the platform.

        Args:
            exclude_internal: If True, hide internal (staff-only) roles.
        """
        data = client.get("/api/v1/auth/roles", params={"exclude_internal": exclude_internal})
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_create_role(
        name: str,
        description: str | None = None,
        permissions: list[str] | None = None,
        is_internal: bool = False,
    ) -> str:
        """
        Create a new RBAC role (admin only).

        Args:
            name: Role name (2-50 chars, e.g. "AUDITOR").
            description: Human-readable description.
            permissions: List of permission strings.
            is_internal: If True, marks this role as internal/staff-only.
        """
        payload: dict[str, Any] = {
            "name": name,
            "permissions": permissions or [],
            "is_internal": is_internal,
        }
        if description:
            payload["description"] = description
        data = client.post("/api/v1/auth/roles", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_assign_role(
        user_id: str,
        role_id: str,
        organization_id: str | None = None,
    ) -> str:
        """
        Assign an RBAC role to a user (admin only).

        Args:
            user_id: UUID of the target user.
            role_id: UUID of the role to assign.
            organization_id: Scope assignment to this org (optional).
        """
        payload: dict[str, Any] = {"user_id": user_id, "role_id": role_id}
        if organization_id:
            payload["organization_id"] = organization_id
        data = client.post("/api/v1/auth/roles/assign", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)
