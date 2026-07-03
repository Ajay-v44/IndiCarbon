from typing import List, Dict, Any, Optional
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
    
    formatted_items = []
    for item in items:
        new_item = dict(item)
        y = item.get("year")
        if isinstance(y, int) or (isinstance(y, str) and y.isdigit()):
            new_item["year"] = f"{y}-01-01"
        elif isinstance(y, str) and len(y) == 4:
            new_item["year"] = f"{y}-01-01"
        formatted_items.append(new_item)

    try:
        with httpx.Client() as client:
            resp = client.post(
                url, 
                params=params, 
                json=formatted_items,
                headers={
                    "X-User-ID": user_id,
                    "X-Organization-ID": organization_id,
                }
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        return {"error": str(e)}


@tool
def calculate_carbon_credits(
    project_type: str,
    energy_produced_mwh: Optional[float] = None,
    fuel_switched_litre: Optional[float] = None,
    waste_diverted_tonnes: Optional[float] = None,
    trees_planted: Optional[int] = None,
    area_hectares: Optional[float] = None,
    project_lifetime_years: Optional[int] = 10,
) -> Dict[str, Any]:
    """
    Calculates carbon credits for a sustainability project based on its type and input metrics.
    
    Uses India-specific emission factors and CDM/VCS methodologies:
    - Solar/Wind energy: Grid emission factor (CEA India) = 0.82 tCO2/MWh
    - Biomass energy: Net factor = 0.50 tCO2/MWh
    - Fuel switching (diesel→CNG/electric): Diesel = 2.68 kgCO2/litre
    - Waste diversion (landfill avoidance): 0.50 tCO2e/tonne methane avoidance
    - Afforestation/Reforestation: ~3.67 tCO2/tree over 10 years (avg Indian species)
    - Each 1 tCO2e avoided = 1 carbon credit (Verified Carbon Unit / BEE credit)
    
    Args:
        project_type: One of Solar, Wind, Biomass, Fuel Switching, Waste Management, Afforestation, Reforestation
        energy_produced_mwh: Renewable energy generated in MWh per year
        fuel_switched_litre: Litres of fossil fuel displaced per year
        waste_diverted_tonnes: Tonnes of waste diverted from landfill per year
        trees_planted: Total number of trees planted
        area_hectares: Project area in hectares (for afforestation)
        project_lifetime_years: Expected project lifetime in years (default 10)
    
    Returns:
        Dict with: annual_reduction_tco2e, lifetime_reduction_tco2e, estimated_credits, methodology, confidence_score, notes
    """
    SOLAR_WIND_FACTOR = 0.82     # tCO2/MWh — CEA India grid emission factor 2023-24
    BIOMASS_FACTOR = 0.50        # tCO2/MWh net (accounting for biomass carbon neutrality)
    DIESEL_FACTOR = 0.00268      # tCO2/litre
    WASTE_FACTOR = 0.50          # tCO2e/tonne (methane avoidance, CDM AMS-III.F)
    TREE_FACTOR = 3.67           # tCO2 sequestered per tree over 10 years (avg India)
    AFFORESTATION_FACTOR = 6.0   # tCO2/hectare/year (CDM AR methodology, India avg)
    CREDITS_PER_TCO2 = 1.0       # 1 tCO2e = 1 carbon credit (VCU / BEE credit)

    annual_tco2 = 0.0
    methodology = ""
    notes_parts = []
    confidence = 0.85
    lifetime = project_lifetime_years or 10

    ptype = project_type.lower().strip()

    if ptype in ("solar", "wind", "solar pv grid connect", "wind power project"):
        if energy_produced_mwh and energy_produced_mwh > 0:
            annual_tco2 = energy_produced_mwh * SOLAR_WIND_FACTOR
            methodology = "CDM AMS-I.D — Grid-Connected Renewable Electricity Generation"
            notes_parts.append(
                f"Using CEA India grid emission factor {SOLAR_WIND_FACTOR} tCO₂/MWh. "
                f"Energy produced: {energy_produced_mwh:,.1f} MWh/yr → "
                f"{annual_tco2:,.2f} tCO₂e/yr avoided."
            )
        else:
            confidence = 0.3
            notes_parts.append("Energy production data (MWh/yr) not provided. Estimate unreliable.")

    elif ptype in ("biomass", "biomass energy"):
        if energy_produced_mwh and energy_produced_mwh > 0:
            annual_tco2 = energy_produced_mwh * BIOMASS_FACTOR
            methodology = "CDM AMS-I.C — Thermal Energy Production with or Without Electricity"
            notes_parts.append(
                f"Net biomass emission factor {BIOMASS_FACTOR} tCO₂/MWh applied. "
                f"Annual reduction: {annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3

    elif ptype in ("fuel switching", "fuel switch"):
        if fuel_switched_litre and fuel_switched_litre > 0:
            annual_tco2 = fuel_switched_litre * DIESEL_FACTOR
            methodology = "CDM AMS-III.C — Emission Reductions by Low-GHG Activity"
            notes_parts.append(
                f"Diesel emission factor {DIESEL_FACTOR} tCO₂/litre. "
                f"Fuel displaced: {fuel_switched_litre:,.0f} litres/yr → "
                f"{annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3

    elif ptype in ("waste management", "methane avoidance", "waste", "biomass + waste"):
        if waste_diverted_tonnes and waste_diverted_tonnes > 0:
            annual_tco2 = waste_diverted_tonnes * WASTE_FACTOR
            methodology = "CDM AMS-III.F — Avoidance of Methane Emissions Through Composting"
            notes_parts.append(
                f"Methane avoidance factor {WASTE_FACTOR} tCO₂e/tonne. "
                f"Waste diverted: {waste_diverted_tonnes:,.1f} tonnes/yr → "
                f"{annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3

    elif ptype in ("afforestation", "reforestation", "tree plantation"):
        if trees_planted and trees_planted > 0:
            lifetime_tco2 = trees_planted * TREE_FACTOR
            annual_tco2 = lifetime_tco2 / max(lifetime, 10)
            methodology = "CDM AR-ACM0003 — Afforestation and Reforestation of Lands (India)"
            notes_parts.append(
                f"Average Indian species sequestration: {TREE_FACTOR} tCO₂/tree over 10 yrs. "
                f"Trees: {trees_planted:,} → Lifetime: {lifetime_tco2:,.1f} tCO₂e, "
                f"Annual: {annual_tco2:,.2f} tCO₂e/yr."
            )
        elif area_hectares and area_hectares > 0:
            annual_tco2 = area_hectares * AFFORESTATION_FACTOR
            methodology = "CDM AR-ACM0003 — Afforestation and Reforestation of Lands (India)"
            notes_parts.append(
                f"Area-based factor: {AFFORESTATION_FACTOR} tCO₂/ha/yr. "
                f"Area: {area_hectares} ha → {annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3

    else:
        # Generic estimate based on whatever data is available
        confidence = 0.5
        methodology = "Indicative estimate — specific methodology pending project documentation"
        notes_parts.append("Project type not precisely matched. Estimate based on available data.")
        if energy_produced_mwh:
            annual_tco2 += energy_produced_mwh * SOLAR_WIND_FACTOR * 0.7

    lifetime_tco2 = annual_tco2 * lifetime
    estimated_credits = round(lifetime_tco2 * CREDITS_PER_TCO2)

    if not notes_parts:
        notes_parts.append("Insufficient input data for reliable credit calculation. Please provide energy/fuel/waste quantities.")
        confidence = 0.2

    notes_parts.append(
        f"\nEstimated over {lifetime}-year project lifetime: "
        f"{lifetime_tco2:,.1f} tCO₂e total → {estimated_credits:,} carbon credits. "
        f"Registry recommendation: {'VERRA VCS' if estimated_credits >= 500 else 'BEE CCTS (national registry)'}."
    )

    return {
        "annual_reduction_tco2e": round(annual_tco2, 4),
        "lifetime_reduction_tco2e": round(lifetime_tco2, 4),
        "estimated_credits": estimated_credits,
        "methodology": methodology,
        "confidence_score": confidence,
        "registry_recommendation": "VERRA VCS" if estimated_credits >= 500 else "BEE CCTS",
        "notes": " ".join(notes_parts),
    }
