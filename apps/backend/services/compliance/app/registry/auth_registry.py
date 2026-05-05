from shared_logic.schemas.auth_schemas import OrganizationResponse
from shared_logic import ServiceName, get_service_client

async def get_org_by_id(user_id:str,org_id:str)->OrganizationResponse:

    client = get_service_client(ServiceName.AUTH, caller="compliance-service")

    response = await client.aget_json(
        f"/api/v1/organizations/{org_id}",
        headers={
            "x-user-id": user_id,
        }
    )
    return response