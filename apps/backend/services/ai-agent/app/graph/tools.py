from typing import List, Dict, Any
from langchain.tools import tool
import httpx
from ..config.settings import get_settings

@tool
def get_emission_factors(year: int) -> List[Dict[str, Any]]:
    """
    Retrieves emission factors for a given year.
    Use this to get the available factors to map document emissions.
    """
    s = get_settings()
    url = f"{s.compliance_service_url}/api/v1/emissions/factors"
    try:
        with httpx.Client() as client:
            resp = client.get(url, params={"vintage_year": year})
            resp.raise_for_status()
            return resp.json().get("data", [])
    except Exception as e:
        return [{"error": str(e)}]



@tool
def calculate_scope_emissions(items: List[Dict[str, Any]], organization_id: str, revenue_crore: float, document_id: str, user_id: str) -> Dict[str, Any]:
    """
    Calculates scope emissions for a given list of emission items.
    'items' must be a list of dictionaries, where each dict has: 'year' (int), 'factor_key' (string), and 'raw_quantity' (float).
    """
    s = get_settings()
    url = f"{s.compliance_service_url}/api/v1/emissions/calculate_scope_emissions"
    params = {
        "revenue_crore": revenue_crore,
        "document_id": document_id
    }
    
    try:
        with httpx.Client() as client:
            resp = client.post(
                url, 
                params=params, 
                json=items,
                headers={
                    "X-User-ID": user_id,
                    "X-Organization-ID": organization_id,
                }
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        return {"error": str(e)}
