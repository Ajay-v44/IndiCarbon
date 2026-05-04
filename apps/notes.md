admin@indicarbon.com
admin123



from shared_logic import ServiceName, get_service_client

client = get_service_client(ServiceName.COMPLIANCE, caller="ai-agent")

response = await client.aget_json(
    "/api/v1/emissions/summary",
    params={
        "organization_id": str(org_id),
        "period_start": "2026-01-01",
        "period_end": "2026-12-31",
    },
    user=current_user,
)
