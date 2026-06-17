"""
Document vault tools.

Gateway routes (all behind /api/v1/documents):
  POST   /                      Register document after upload to Supabase Storage
  GET    /?organization_id=...  List documents for an organisation
  GET    /{doc_id}              Get document metadata
  PATCH  /{doc_id}/verify       Mark document verified/unverified (auditor)
  GET    /{doc_id}/signed-url   Get time-limited presigned download URL
"""

from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from .. import client


def register(mcp: FastMCP) -> None:

    @mcp.tool()
    def indicarbon_register_document(
        organization_id: str,
        doc_type: str,
        file_path: str,
        file_hash: str | None = None,
        mime_type: str | None = None,
        metadata: dict | None = None,
    ) -> str:
        """
        Register a document that has already been uploaded to Supabase Storage.
        This records the document in IndiCarbon's vault and links it to an org.

        Args:
            organization_id: UUID of the owning organization.
            doc_type: Document category. Examples: "annual_report", "energy_bill",
                      "sustainability_report", "brsr_disclosure", "carbon_audit".
            file_path: Path in Supabase Storage bucket (e.g. "org-uuid/reports/2024.pdf").
            file_hash: Optional SHA-256 hash for integrity verification.
            mime_type: MIME type (e.g. "application/pdf", "text/csv").
            metadata: Arbitrary key-value metadata to attach to the document.
        """
        payload: dict[str, Any] = {
            "organization_id": organization_id,
            "doc_type": doc_type,
            "file_path": file_path,
        }
        if file_hash:
            payload["file_hash"] = file_hash
        if mime_type:
            payload["mime_type"] = mime_type
        if metadata:
            payload["metadata"] = metadata

        data = client.post("/api/v1/documents", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_documents(
        organization_id: str,
        doc_type: str | None = None,
    ) -> str:
        """
        List documents registered in the vault for an organization.

        Args:
            organization_id: UUID of the organization.
            doc_type: Filter by document type (optional).
        """
        params: dict[str, Any] = {"organization_id": organization_id}
        if doc_type:
            params["doc_type"] = doc_type
        data = client.get("/api/v1/documents", params=params)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_get_document(doc_id: str) -> str:
        """
        Get full metadata for a document by its UUID.

        Args:
            doc_id: Document UUID.
        """
        data = client.get(f"/api/v1/documents/{doc_id}")
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_verify_document(
        doc_id: str,
        is_verified: bool,
        metadata: dict | None = None,
    ) -> str:
        """
        Mark a document as verified or unverified (auditor action).
        Verification unlocks downstream compliance calculations.

        Args:
            doc_id: Document UUID.
            is_verified: True to verify, False to revoke verification.
            metadata: Optional audit notes or verification evidence to attach.
        """
        payload: dict[str, Any] = {"is_verified": is_verified}
        if metadata:
            payload["metadata"] = metadata
        data = client.patch(f"/api/v1/documents/{doc_id}/verify", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_get_document_signed_url(doc_id: str) -> str:
        """
        Generate a time-limited signed download URL for a document stored in
        Supabase Storage. URL is valid for a short period (typically 15 minutes).

        Args:
            doc_id: Document UUID.
        """
        data = client.get(f"/api/v1/documents/{doc_id}/signed-url")
        payload = data.get("data") or data
        return json.dumps(payload, indent=2, default=str)
