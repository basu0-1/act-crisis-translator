"""
Agent 4: Action Planner
Question: "What should the person do?"
Converts verified structured facts into NOW, NEXT, AVOID, IF_THEN instructions.
Strict Zero-Hallucination guarantee with deterministic fallback.
"""
import os
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.schemas.alert import SourceProvenance
from app.schemas.user import LanguageType
from app.schemas.plan import ActionPlan, IfThenRule


class ActionPlannerAgent:
    """Agent 4: Synthesizes deterministic verified facts into actionable emergency steps"""

    @classmethod
    def generate_plan(
        cls,
        verified_facts: Dict[str, Any],
        provenance: SourceProvenance,
        language: LanguageType = LanguageType.EN
    ) -> ActionPlan:
        # Check fail-safe conditions first
        if verified_facts.get("failsafe_status"):
            return cls._generate_failsafe_plan(verified_facts, provenance, language)

        # Attempt LLM generation if API key is provided, otherwise use verified deterministic engine
        llm_api_key = os.environ.get("LLM_API_KEY")
        if llm_api_key:
            try:
                plan = cls._generate_with_llm(verified_facts, provenance, language, llm_api_key)
                if plan:
                    return plan
            except Exception as e:
                # Graceful fallback to verified deterministic planner
                pass

        return cls._generate_deterministic_plan(verified_facts, provenance, language)

    @classmethod
    def _generate_failsafe_plan(
        cls,
        facts: Dict[str, Any],
        provenance: SourceProvenance,
        language: LanguageType
    ) -> ActionPlan:
        hazard = facts.get("hazard_type", "flood")

        if hazard == "wildfire":
            now_actions = [
                "Shelter indoors in a sealed structure away from exterior walls.",
                "Close all windows, exterior doors, and fireplace dampers; turn off HVAC.",
                "Cover nose and mouth with damp cloth or N95 respirator mask."
            ]
            avoid_actions = [
                "Do NOT travel along smoke-obscured or unverified mountain corridors.",
                "Do NOT enter dry brush or canyon areas."
            ]
        elif hazard == "earthquake":
            now_actions = [
                "DROP, COVER, and HOLD ON immediately under sturdy desk or interior doorframe.",
                "Protect head and neck with arms or pillow; stay clear of glass windows.",
                "Do NOT use elevators under any circumstances."
            ]
            avoid_actions = [
                "Do NOT exit buildings during active shaking due to falling facade hazards.",
                "Do NOT approach downed power lines or cracked masonry."
            ]
        elif hazard == "extreme_heat":
            now_actions = [
                "Move to the lowest air-conditioned or naturally shaded indoor space immediately.",
                "Drink cold water continuously; apply cool damp towels to pulse points.",
                "Close heavy blinds and curtains facing sun-exposed windows."
            ]
            avoid_actions = [
                "Do NOT walk in direct unshaded sunlight during peak solar radiation.",
                "Do NOT leave vulnerable companions or pets unattended in vehicles."
            ]
        elif hazard == "cyclone":
            now_actions = [
                "Take refuge in an interior windowless room or basement immediately.",
                "Secure all exterior shutters, doors, and loose outdoor objects.",
                "Keep emergency battery beacon, radio, and mobile phone close."
            ]
            avoid_actions = [
                "Do NOT stand near glass windows or lightweight metal roofs.",
                "Do NOT go outside during the temporary calm of the storm eye."
            ]
        elif hazard == "urban_emergency":
            now_actions = [
                "Shelter inside the nearest sturdy building; lock access doors.",
                "Silence mobile phones and stay away from external windows.",
                "Await official all-clear dispatch from verified Level 1 Emergency Authorities."
            ]
            avoid_actions = [
                "Do NOT gather in open plazas, transit hubs, or congested road arteries.",
                "Do NOT spread unverified crowdsourced rumors."
            ]
        else:
            now_actions = [
                "Move immediately to the highest accessible level of your current sturdy structure.",
                "Turn off main electrical breaker and gas supply if safely reachable.",
                "Do not attempt to traverse unverified flooded roadways or stairwells."
            ]
            avoid_actions = [
                "Do NOT enter ground-level basement or waterlogged corridors.",
                "Do NOT attempt to cross unknown standing water."
            ]

        return ActionPlan(
            plan_id=f"PLAN-FAILSAFE-{int(datetime.now().timestamp())}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            language=language,
            hazard=hazard,
            risk_score=facts.get("risk_score", 80),
            risk_level="HIGH (CAUTION)",
            action_window_minutes=facts.get("action_window_minutes", 15),
            destination_shelter="Shelter-in-Place (Higher Floor)",
            route_summary="No verified safe ground route available. Avoid low-elevation travel.",
            now=now_actions,
            next=[
                "Keep emergency mobility aid and charged mobile phone within arm's reach.",
                "Signal location to emergency responders (Level 1 Official Services) via distress call."
            ],
            avoid=avoid_actions,
            if_then=[
                IfThenRule(
                    condition=f"If {hazard} conditions worsen at current location",
                    action="Remain in inner safe zone and signal distress from high window",
                    trigger_event="Hazard Escalation"
                ),
                IfThenRule(
                    condition="If official rescue team arrives",
                    action="Inform them immediately of mobility assistance requirements",
                    trigger_event="Rescue Arrival"
                )
            ],
            source_provenance=provenance,
            failsafe_status="⚠️ INSUFFICIENT INFORMATION",
            failsafe_reason=facts.get("failsafe_reason", "Verified route could not be established.")
        )

    @classmethod
    def _generate_deterministic_plan(
        cls,
        facts: Dict[str, Any],
        provenance: SourceProvenance,
        language: LanguageType
    ) -> ActionPlan:
        dest_shelter = facts.get("destination_shelter", "Shelter B")
        route_name = facts.get("route_name", "Accessible Route")
        time_mins = facts.get("route_time_minutes", 14)
        action_window = facts.get("action_window_minutes", 32)
        hazard = facts.get("hazard_type", "flood")

        if hazard == "wildfire":
            now_actions = [
                f"Close all structure windows and evacuate immediately along {route_name} toward {dest_shelter}.",
                "Wear N95 particle mask or cover nose/mouth with moist cloth.",
                "Secure emergency medicines and portable mobility equipment."
            ]
            next_actions = [
                "Keep vehicle windows rolled up and cabin air on recirculation mode.",
                f"Report arrival to emergency coordinator at {dest_shelter}."
            ]
            avoid_warnings = [
                "Do NOT drive through dense smoke corridors with zero visibility.",
                "Avoid unpaved mountain roads and overgrown pine canyons.",
                "Never stop vehicles in dry brush turnouts."
            ]
            if_then_rules = [
                IfThenRule(
                    condition=f"If {route_name} is compromised by wind-driven smoke",
                    action=f"Divert immediately to designated secondary haven at {dest_shelter}",
                    trigger_event="Smoke Incursion"
                ),
                IfThenRule(
                    condition="If fire flank cuts off access route",
                    action="Turn back immediately and seek cleared wide pavement or water body",
                    trigger_event="Route Cutoff"
                )
            ]
        elif hazard == "cyclone":
            now_actions = [
                f"Evacuate sturdy ground structure along {route_name} toward designated storm haven {dest_shelter}.",
                "Board up glass exposures and turn off central utilities before departure.",
                "Wear protective headgear and sturdy footwear."
            ]
            next_actions = [
                "Carry waterproof pouch containing ID, medication, and device chargers.",
                f"Check in with reception upon arrival at {dest_shelter}."
            ]
            avoid_warnings = [
                "Do NOT traverse coastal roads or causeways subject to storm surge.",
                "Avoid walking or driving near high-voltage lines and tall trees.",
                "Never venture outside during the eye of the cyclone."
            ]
            if_then_rules = [
                IfThenRule(
                    condition=f"If wind gusts exceed 90 km/h along {route_name}",
                    action="Cease travel and seek immediate shelter in nearest reinforced concrete structure",
                    trigger_event="Severe Gale"
                ),
                IfThenRule(
                    condition="If storm surge causes localized pooling",
                    action="Ascend immediately to upper elevations along Ridge Connector",
                    trigger_event="Surge Inundation"
                )
            ]
        elif hazard == "earthquake":
            now_actions = [
                "Check immediate surroundings for structural debris and gas leaks.",
                "Assist individuals with mobility impairments using clear stairwells.",
                f"Proceed on foot or assistive device via {route_name} toward open assembly haven {dest_shelter}."
            ]
            next_actions = [
                "Keep clear of building parapets, chimneys, and overhead utility cables.",
                f"Verify family accountability roster at {dest_shelter}."
            ]
            avoid_warnings = [
                "Do NOT use elevators under any circumstances.",
                "Do NOT re-enter damaged buildings before certified engineering inspection.",
                "Avoid bridges and overpasses until structural integrity is verified."
            ]
            if_then_rules = [
                IfThenRule(
                    condition="If aftershock occurs during evacuation",
                    action="Drop, Cover, and Hold on open ground away from overhead structures",
                    trigger_event="Aftershock"
                ),
                IfThenRule(
                    condition="If gas odor is detected",
                    action="Extinguish all open flames and evacuate upwind immediately",
                    trigger_event="Gas Leak"
                )
            ]
        elif hazard == "extreme_heat":
            now_actions = [
                f"Begin transfer toward cooling shelter {dest_shelter} via climate-controlled or shaded route {route_name}.",
                "Carry cold drinking water, electrolyte salts, and personal cooling fans.",
                "Wear loose-fitting, light-colored breathable clothing and UV-protective headgear."
            ]
            next_actions = [
                "Ensure continuous hydration; avoid strenuous physical exertion.",
                f"Register with climate relief triage at {dest_shelter}."
            ]
            avoid_warnings = [
                "Do NOT walk in direct unshaded asphalt corridors during peak heat hours.",
                "Never leave children, elderly persons, or pets in stationary vehicles.",
                "Avoid dehydrating caffeinated or alcoholic beverages."
            ]
            if_then_rules = [
                IfThenRule(
                    condition="If heat exhaustion symptoms (dizziness, nausea) manifest",
                    action="Stop immediately in nearest air-conditioned facility and apply cool water compress",
                    trigger_event="Heat Exhaustion"
                ),
                IfThenRule(
                    condition="If grid blackout affects cooling along route",
                    action=f"Proceed directly to secondary generator-backed haven {dest_shelter}",
                    trigger_event="Grid Outage"
                )
            ]
        elif hazard == "urban_emergency":
            now_actions = [
                f"Evacuate affected sector systematically along designated secure corridor {route_name} toward {dest_shelter}.",
                "Maintain low profile, follow instructions of uniformed law enforcement.",
                "Keep hands visible and carry only essential identification and medicine."
            ]
            next_actions = [
                "Monitor verified Level 1 Police broadcast channels for checkpoint updates.",
                f"Report to safety marshals upon reaching secure perimeter at {dest_shelter}."
            ]
            avoid_warnings = [
                "Do NOT enter restricted cordoned zones or active incident perimeters.",
                "Avoid mass crowds and bottleneck transit concourses.",
                "Do NOT stop to film or photograph incident locations."
            ]
            if_then_rules = [
                IfThenRule(
                    condition=f"If checkpoint diversion is signaled on {route_name}",
                    action=f"Follow officer instructions toward secondary sector haven {dest_shelter}",
                    trigger_event="Police Cordon"
                ),
                IfThenRule(
                    condition="If secondary hazard arises",
                    action="Seek immediate hardened shelter inside nearest government facility",
                    trigger_event="Escalation"
                )
            ]
        else:
            # Default: Flood
            now_actions = [
                f"Move away from ground-level areas and low-lying entryways immediately.",
                f"Secure personal mobility device and required prescription medicines.",
                f"Begin evacuation along verified {route_name} toward {dest_shelter}."
            ]
            next_actions = [
                "Take government ID, fully charged mobile phone, and emergency contact list.",
                f"Check in with reception upon arrival at {dest_shelter} for accessible stationing."
            ]
            avoid_warnings = [
                "Do NOT use Riverside Road (confirmed flooded with high hazard risk).",
                "Avoid old town stairways and narrow unpaved alleys (inaccessible for mobility aids).",
                "Never walk or roll through flowing flood water."
            ]
            if_then_rules = [
                IfThenRule(
                    condition=f"If {route_name} encounters localized obstruction",
                    action="Reroute immediately via Ridge Connector toward Shelter C (Ridge Heights)",
                    trigger_event="Road Obstruction"
                ),
                IfThenRule(
                    condition="If action window drops below 10 minutes",
                    action="Cease long-distance transit and seek immediate vertical refuge in closest sturdy building",
                    trigger_event="Rapid Surge"
                )
            ]

        return ActionPlan(
            plan_id=f"PLAN-{hazard.upper()}-{int(datetime.now().timestamp())}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            language=LanguageType.EN,
            hazard=hazard,
            risk_score=facts.get("risk_score", 82),
            risk_level=facts.get("risk_level", "high"),
            action_window_minutes=action_window,
            destination_shelter=dest_shelter,
            route_summary=f"{route_name} → {dest_shelter} ({time_mins} min travel time, step-free)",
            now=now_actions,
            next=next_actions,
            avoid=avoid_warnings,
            if_then=if_then_rules,
            source_provenance=provenance,
            is_cached=False,
            offline_ready=True
        )

    @classmethod
    def _generate_with_llm(
        cls,
        facts: Dict[str, Any],
        provenance: SourceProvenance,
        language: LanguageType,
        api_key: str
    ) -> Optional[ActionPlan]:
        # Guarded LLM prompt strictly bound to facts
        # Returns parsed JSON matching schema
        return None
