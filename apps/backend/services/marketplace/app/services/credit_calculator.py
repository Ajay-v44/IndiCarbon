"""
credit_calculator.py
─────────────────────
India-specific carbon credit calculation engine.
Uses CDM/VCS methodologies and CEA India emission factors.

This module is used by the projects route to auto-evaluate credit potential
when an organization submits a carbon reduction project.
"""
from __future__ import annotations

from typing import Optional


# ─── India Emission Factors (2023-24) ─────────────────────────────────────────
SOLAR_WIND_GRID_FACTOR = 0.82    # tCO2/MWh — CEA India CO2 baseline 2023-24
BIOMASS_NET_FACTOR = 0.50        # tCO2/MWh — net factor (biomass carbon neutrality)
DIESEL_FACTOR = 0.00268          # tCO2/litre — IPCC Tier 1 diesel
LPG_FACTOR = 0.00163             # tCO2/litre — IPCC Tier 1 LPG
WASTE_METHANE_FACTOR = 0.50      # tCO2e/tonne — CDM AMS-III.F methane avoidance
TREE_SEQ_FACTOR = 3.67           # tCO2/tree — avg Indian species over 10 years
AFFORESTATION_HA_FACTOR = 6.0    # tCO2/ha/year — CDM AR avg India


def calculate_project_credits(
    project_type: str,
    energy_produced_mwh: Optional[float] = None,
    fuel_switched_litre: Optional[float] = None,
    waste_diverted_tonnes: Optional[float] = None,
    trees_planted: Optional[int] = None,
    area_hectares: Optional[float] = None,
    project_lifetime_years: int = 10,
) -> dict:
    """
    Calculate carbon credit potential for a sustainability project.

    Returns:
        dict with keys:
          - annual_reduction_tco2e
          - lifetime_reduction_tco2e
          - estimated_credits  (int, 1 credit = 1 tCO2e)
          - methodology
          - confidence_score (0-1)
          - registry_recommendation
          - notes
    """
    annual_tco2 = 0.0
    methodology = ""
    notes_parts: list[str] = []
    confidence = 0.85
    lifetime = max(project_lifetime_years or 10, 1)

    ptype = (project_type or "").lower().strip()

    if ptype in ("solar", "wind", "solar pv grid connect", "wind power project", "solar pv", "wind energy"):
        if energy_produced_mwh and energy_produced_mwh > 0:
            annual_tco2 = energy_produced_mwh * SOLAR_WIND_GRID_FACTOR
            methodology = "CDM AMS-I.D — Grid-Connected Renewable Electricity Generation"
            notes_parts.append(
                f"CEA India grid emission factor {SOLAR_WIND_GRID_FACTOR} tCO₂/MWh applied. "
                f"Energy produced: {energy_produced_mwh:,.1f} MWh/yr → "
                f"{annual_tco2:,.2f} tCO₂e/yr avoided."
            )
        else:
            confidence = 0.3
            notes_parts.append("Energy production (MWh/yr) not provided — estimate unreliable.")

    elif ptype in ("biomass", "biomass energy", "biomass electricity"):
        if energy_produced_mwh and energy_produced_mwh > 0:
            annual_tco2 = energy_produced_mwh * BIOMASS_NET_FACTOR
            methodology = "CDM AMS-I.C — Thermal Energy Production with or Without Electricity"
            notes_parts.append(
                f"Net biomass factor {BIOMASS_NET_FACTOR} tCO₂/MWh. "
                f"Annual reduction: {annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3
            notes_parts.append("Energy output (MWh/yr) not provided.")

    elif ptype in ("fuel switching", "fuel switch", "energy efficiency"):
        if fuel_switched_litre and fuel_switched_litre > 0:
            annual_tco2 = fuel_switched_litre * DIESEL_FACTOR
            methodology = "CDM AMS-III.C — Emission Reductions by Low-GHG Activity"
            notes_parts.append(
                f"Diesel emission factor {DIESEL_FACTOR} tCO₂/litre. "
                f"Fuel displaced: {fuel_switched_litre:,.0f} litres/yr → "
                f"{annual_tco2:,.2f} tCO₂e/yr."
            )
        elif energy_produced_mwh and energy_produced_mwh > 0:
            annual_tco2 = energy_produced_mwh * SOLAR_WIND_GRID_FACTOR * 0.8
            methodology = "CDM AMS-I.D — Energy Efficiency / Fuel Switch"
            notes_parts.append(f"Efficiency-based estimate: {annual_tco2:,.2f} tCO₂e/yr.")
        else:
            confidence = 0.3
            notes_parts.append("Fuel displaced (litres/yr) not provided.")

    elif ptype in ("waste management", "methane avoidance", "waste", "waste heat recovery",
                   "methane capture", "biomass + waste"):
        if waste_diverted_tonnes and waste_diverted_tonnes > 0:
            annual_tco2 = waste_diverted_tonnes * WASTE_METHANE_FACTOR
            methodology = "CDM AMS-III.F — Avoidance of Methane Emissions Through Composting"
            notes_parts.append(
                f"Methane avoidance factor {WASTE_METHANE_FACTOR} tCO₂e/tonne. "
                f"Waste diverted: {waste_diverted_tonnes:,.1f} t/yr → "
                f"{annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3
            notes_parts.append("Waste diverted (tonnes/yr) not provided.")

    elif ptype in ("afforestation", "reforestation", "tree plantation", "carbon capture"):
        if trees_planted and trees_planted > 0:
            lifetime_from_trees = trees_planted * TREE_SEQ_FACTOR
            annual_tco2 = lifetime_from_trees / max(lifetime, 10)
            methodology = "CDM AR-ACM0003 — Afforestation and Reforestation of Lands"
            notes_parts.append(
                f"Indian species avg: {TREE_SEQ_FACTOR} tCO₂/tree over 10 yrs. "
                f"{trees_planted:,} trees → Lifetime: {lifetime_from_trees:,.1f} tCO₂e, "
                f"Annual: {annual_tco2:,.2f} tCO₂e/yr."
            )
        elif area_hectares and area_hectares > 0:
            annual_tco2 = area_hectares * AFFORESTATION_HA_FACTOR
            methodology = "CDM AR-ACM0003 — Afforestation and Reforestation of Lands"
            notes_parts.append(
                f"Area-based: {AFFORESTATION_HA_FACTOR} tCO₂/ha/yr × "
                f"{area_hectares} ha = {annual_tco2:,.2f} tCO₂e/yr."
            )
        else:
            confidence = 0.3
            notes_parts.append("Trees planted or area (ha) not provided.")

    elif ptype in ("hydrogen", "green hydrogen"):
        if energy_produced_mwh and energy_produced_mwh > 0:
            annual_tco2 = energy_produced_mwh * SOLAR_WIND_GRID_FACTOR * 0.9
            methodology = "CDM AMS-I.D — Green Hydrogen via Renewable Electrolysis"
            notes_parts.append(f"Green hydrogen estimate: {annual_tco2:,.2f} tCO₂e/yr.")
        else:
            confidence = 0.4
            notes_parts.append("Energy input for electrolysis not provided.")

    else:
        # Generic fallback
        confidence = 0.45
        methodology = "Indicative estimate — specific CDM methodology pending documentation review"
        notes_parts.append(f"Project type '{project_type}' — using generic estimate.")
        if energy_produced_mwh:
            annual_tco2 += energy_produced_mwh * SOLAR_WIND_GRID_FACTOR * 0.7
        if waste_diverted_tonnes:
            annual_tco2 += waste_diverted_tonnes * WASTE_METHANE_FACTOR * 0.7

    lifetime_tco2 = annual_tco2 * lifetime
    estimated_credits = max(0, int(lifetime_tco2))

    registry = "VERRA VCS" if estimated_credits >= 500 else "BEE CCTS (India National Registry)"

    notes_parts.append(
        f"Estimated over {lifetime}-year project lifetime: "
        f"{lifetime_tco2:,.1f} tCO₂e total → {estimated_credits:,} carbon credits. "
        f"Recommended registry: {registry}."
    )

    return {
        "annual_reduction_tco2e": round(annual_tco2, 4),
        "lifetime_reduction_tco2e": round(lifetime_tco2, 4),
        "estimated_credits": estimated_credits,
        "methodology": methodology,
        "confidence_score": round(confidence, 2),
        "registry_recommendation": registry,
        "notes": " ".join(notes_parts),
    }
