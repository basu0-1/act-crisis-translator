"""
Alert Engine for ACT: Alert Validation & Provenance Verification
"""
from typing import Tuple, Optional
import math
from app.schemas.alert import Alert, AlertSeverity, SourceLevel, SourceProvenance


class AlertEngine:
    """Validates and processes emergency alerts with source provenance evaluation"""

    @staticmethod
    def validate_alert(alert: Alert) -> Tuple[bool, Optional[str]]:
        """Ensures alert contains non-null mandatory fields"""
        if not alert.id or not alert.headline:
            return False, "Alert identifier or headline is missing"
        if alert.radius_km <= 0:
            return False, "Invalid hazard radius specified"
        if alert.time_to_impact_minutes < 0:
            return False, "Invalid time to impact"
        return True, None

    @staticmethod
    def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine distance calculation in kilometers"""
        R = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    @staticmethod
    def evaluate_user_exposure(alert: Alert, user_lat: float, user_lng: float) -> Tuple[float, bool]:
        """Calculates user exposure factor based on distance from hazard epicenter"""
        dist = AlertEngine.calculate_distance_km(alert.lat, alert.lng, user_lat, user_lng)
        if dist <= alert.radius_km * 0.7:
            # Deep inside affected hazard zone
            return 1.0, True
        elif dist <= alert.radius_km:
            # Inside outer perimeter
            return 0.8, True
        elif dist <= alert.radius_km * 1.5:
            # High proximity buffer
            return 0.4, False
        else:
            return 0.1, False

    @staticmethod
    def resolve_source_conflict(alert_a: Alert, alert_b: Alert) -> Alert:
        """
        Resolves conflicts between competing emergency alert reports using strict Source Hierarchy:
        Level 1 (Official Authority) > Level 2 (Infrastructure/Meteo) > Level 3 (Verified Local) > Level 4 (Unverified User)
        Tiebreaker: Confidence score > Timestamp recency > Alert A.
        """
        lvl_a = int(alert_a.source_level.value if hasattr(alert_a.source_level, "value") else alert_a.source_level)
        lvl_b = int(alert_b.source_level.value if hasattr(alert_b.source_level, "value") else alert_b.source_level)

        # 1. Authority Hierarchy (Lower numeric level = higher authority)
        if lvl_a < lvl_b:
            return alert_a
        elif lvl_b < lvl_a:
            return alert_b

        # 2. Confidence Score Tiebreaker
        conf_a = alert_a.provenance.confidence if alert_a.provenance else 0.5
        conf_b = alert_b.provenance.confidence if alert_b.provenance else 0.5
        if conf_a > conf_b + 0.05:
            return alert_a
        elif conf_b > conf_a + 0.05:
            return alert_b

        # 3. Timestamp Recency Tiebreaker
        ts_a = alert_a.created_at or ""
        ts_b = alert_b.created_at or ""
        if ts_b > ts_a:
            return alert_b

        return alert_a

    @staticmethod
    def harmonize_alerts(alerts: list) -> list:
        """Harmonizes multiple alert feeds by resolving overlapping hazard conflicts"""
        if not alerts:
            return []
        
        # Group by hazard_type
        hazard_groups = {}
        for a in alerts:
            ht = a.hazard_type.value if hasattr(a.hazard_type, "value") else str(a.hazard_type)
            if ht not in hazard_groups:
                hazard_groups[ht] = a
            else:
                hazard_groups[ht] = AlertEngine.resolve_source_conflict(hazard_groups[ht], a)
        
        return list(hazard_groups.values())

    @staticmethod
    def get_source_hierarchy_catalog():
        """Returns standard metadata for the 4-level source provenance hierarchy"""
        return [
            {
                "level": 1,
                "title": "Level 1: Official Emergency Authority",
                "description": "FEMA, NDMA, National Weather Service, Civil Defense. Highest trust, triggers immediate action.",
                "default_confidence": 0.98,
                "verified": True
            },
            {
                "level": 2,
                "title": "Level 2: Trusted Infrastructure & Meteorological",
                "description": "USGS, CWC, State Transportation Departments, automated hydrological gauge networks.",
                "default_confidence": 0.90,
                "verified": True
            },
            {
                "level": 3,
                "title": "Level 3: Verified On-Ground Responders",
                "description": "Red Cross, municipal fire station dispatches, verified emergency field teams.",
                "default_confidence": 0.80,
                "verified": True
            },
            {
                "level": 4,
                "title": "Level 4: Crowdsourced / Citizen Telemetry",
                "description": "Unconfirmed citizen social alerts, bystander reports. Treated as provisional until cross-verified.",
                "default_confidence": 0.45,
                "verified": False
            }
        ]
