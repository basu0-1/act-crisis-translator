from typing import List, Dict, Any
from app.models.models import MobilityTier, SeverityLevel

class ActionPlanService:
    @classmethod
    def generate_plan(
        cls,
        severity: SeverityLevel,
        mobility: MobilityTier,
        is_blocked: bool,
        time_to_impact_minutes: int,
        shelter_name: str
    ) -> Dict[str, Any]:
        """
        Generates contextual emergency decisions: DO NOW, NEXT, AVOID, IF -> THEN.
        """
        do_now = []
        do_next = []
        avoid = []
        if_then = []

        # --- DO NOW ---
        if is_blocked:
            do_now.append({
                "id": "now-divert",
                "text": f"ABANDON Riverside Road immediately. Shift trajectory West toward Ridge Avenue.",
                "priority": "CRITICAL",
                "category": "EVACUATION",
                "icon": "alert-triangle"
            })
            do_now.append({
                "id": "now-shelter-reroute",
                "text": f"Proceed directly to {shelter_name} via the elevated ridge path.",
                "priority": "HIGH",
                "category": "NAVIGATION",
                "icon": "shield"
            })
        else:
            if time_to_impact_minutes <= 15:
                do_now.append({
                    "id": "now-evac-immediate",
                    "text": f"Begin immediate evacuation. Time window is under {time_to_impact_minutes} minutes.",
                    "priority": "CRITICAL",
                    "category": "EVACUATION",
                    "icon": "zap"
                })
            else:
                do_now.append({
                    "id": "now-grab-go",
                    "text": "Grab pre-packed emergency go-bag, government ID, essential medications, and waterproof pouch.",
                    "priority": "HIGH",
                    "category": "PREPARATION",
                    "icon": "package"
                })
            do_now.append({
                "id": "now-leave-lowland",
                "text": f"Move away from basement and ground-floor areas toward {shelter_name}.",
                "priority": "HIGH",
                "category": "EVACUATION",
                "icon": "arrow-up-right"
            })

        # Mobility specific DO NOW
        if mobility == MobilityTier.WHEELCHAIR:
            do_now.append({
                "id": "now-mobility-wheelchair",
                "text": "Check battery charge level on power chair; engage manual transfer locks and stick strictly to ramp-grade sidewalk routes.",
                "priority": "HIGH",
                "category": "ACCESSIBILITY",
                "icon": "accessibility"
            })
        elif mobility == MobilityTier.LIMITED_WALKING:
            do_now.append({
                "id": "now-mobility-limited",
                "text": "Equip walking cane / stability device; proceed at steady cadence and avoid sudden slopes.",
                "priority": "HIGH",
                "category": "ACCESSIBILITY",
                "icon": "user-check"
            })

        # --- NEXT ---
        do_next.append({
            "id": "next-checkin",
            "text": "Send automated SMS check-in or ACT emergency status beacon to emergency contacts.",
            "priority": "MEDIUM",
            "category": "COMMUNICATION",
            "icon": "message-square"
        })
        do_next.append({
            "id": "next-power",
            "text": "Shut off main electrical breaker and gas valve if safely accessible before departing.",
            "priority": "MEDIUM",
            "category": "SAFETY",
            "icon": "power"
        })
        do_next.append({
            "id": "next-shelter-reg",
            "text": f"Check in at arrival desk of {shelter_name} for priority space assignment.",
            "priority": "MEDIUM",
            "category": "SHELTER",
            "icon": "home"
        })

        # --- AVOID ---
        avoid.append({
            "id": "avoid-riverside",
            "text": "DO NOT enter Riverside Road underpass or low-lying riverbank promenades.",
            "priority": "CRITICAL",
            "category": "HAZARD",
            "icon": "slash"
        })
        avoid.append({
            "id": "avoid-driving",
            "text": "DO NOT attempt to drive through moving water. 15 cm of water can knock an adult down; 30 cm floats cars.",
            "priority": "CRITICAL",
            "category": "HAZARD",
            "icon": "alert-octagon"
        })
        avoid.append({
            "id": "avoid-elevators",
            "text": "DO NOT use elevators if power failure or water ingress threatens building shafts.",
            "priority": "HIGH",
            "category": "HAZARD",
            "icon": "ban"
        })

        # --- IF -> THEN ---
        if is_blocked:
            if_then.append({
                "id": "ifthen-blocked-active",
                "condition": "IF Riverside Road Bridge is submerged",
                "action": "THEN continue along Ridge Avenue bypass directly to Highland Crest Haven (recalculated route active).",
                "severity": "CRITICAL"
            })
        else:
            if_then.append({
                "id": "ifthen-roadblock",
                "condition": "IF Riverside Road becomes impassable or barricaded",
                "action": "THEN ACT immediately recalculates route to High Terrace Boulevard and diverts to Highland Crest Shelter.",
                "severity": "HIGH"
            })

        if_then.append({
            "id": "ifthen-trapped",
            "condition": "IF flood waters enter dwelling before departure",
            "action": "THEN move to the highest floor or roof; signal distress with bright cloth or flashlight. Do NOT enter an attic without an outside exit.",
            "severity": "CRITICAL"
        })
        if_then.append({
            "id": "ifthen-offline",
            "condition": "IF cellular network or data connectivity is lost",
            "action": "THEN ACT automatically preserves your cached offline evacuation plan and topological map instructions.",
            "severity": "MODERATE"
        })

        return {
            "do_now": do_now,
            "do_next": do_next,
            "avoid": avoid,
            "if_then": if_then
        }
