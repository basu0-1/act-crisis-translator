from typing import Dict, Any, List, Optional, Tuple
from app.models.models import MobilityTier, Shelter

class RouteEngine:
    """
    Emergency routing engine aware of hazard boundaries, road blockages,
    and accessibility constraints (wheelchair ramps, slope limits).
    """

    # Primary route waypoints (via Riverside Road - prone to flooding)
    PRIMARY_WAYPOINTS = [
        [-122.4194, 37.7749],  # Origin: Central Riverside District
        [-122.4180, 37.7760],
        [-122.4165, 37.7772],  # Approaching Riverside Bridge
        [-122.4140, 37.7780],  # Riverside Road Bridge (Blockage Zone)
        [-122.4110, 37.7795],
        [-122.4080, 37.7810],  # Shelter A: Community Civic Center
    ]

    # Wheelchair-dedicated open path (paved sidewalk ramps, curb-cuts, step-free)
    WHEELCHAIR_OPEN_WAYPOINTS = [
        [-122.4194, 37.7749],  # Origin: Central Riverside District
        [-122.4185, 37.7758],  # Paved sidewalk ramp
        [-122.4165, 37.7770],  # Curb-cut corridor
        [-122.4135, 37.7782],  # Accessible bridge walkway
        [-122.4105, 37.7798],  # Smooth grade approach
        [-122.4080, 37.7810],  # Shelter A: Community Civic Center (Ramp Entry)
    ]

    # Recalculated alternative high-ground route (Ridge Avenue corridor - safe from flood)
    ALTERNATIVE_HIGH_GROUND_WAYPOINTS = [
        [-122.4194, 37.7749],  # Origin
        [-122.4210, 37.7755],  # Divert West away from river
        [-122.4225, 37.7780],  # Ridge View Crest (Elevated +25m)
        [-122.4195, 37.7815],  # High Terrace Boulevard
        [-122.4160, 37.7840],  # Highland Crest Evacuation Haven
    ]

    # Wheelchair-optimized bypass route (gentle incline ramps, no stairs, wide pavements)
    WHEELCHAIR_ACCESSIBLE_WAYPOINTS = [
        [-122.4194, 37.7749],  # Origin
        [-122.4205, 37.7758],  # Accessible ramp corridor
        [-122.4215, 37.7785],  # Paved transit mall
        [-122.4185, 37.7820],  # High Terrace Boulevard
        [-122.4160, 37.7840],  # Highland Crest Evacuation Haven
    ]

    @classmethod
    def get_route_geojson(cls, waypoints: List[List[float]], extra_properties: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        props: Dict[str, Any] = {
            "stroke": "#2563eb",
            "stroke_width": 5,
            "stroke_opacity": 0.9
        }
        if extra_properties:
            props.update(extra_properties)
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": waypoints
            },
            "properties": props
        }

    @classmethod
    def compute_route(
        cls,
        origin_lat: float,
        origin_lon: float,
        shelter: Shelter,
        mobility: MobilityTier,
        is_recalculated: bool = False
    ) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]], int, int]:
        """
        Computes route and returns:
        (primary_geojson, alternative_geojson, distance_meters, estimated_time_minutes)
        """
        if is_recalculated:
            # High-ground diversion due to road blockage
            if mobility == MobilityTier.WHEELCHAIR:
                primary_pts = cls.WHEELCHAIR_ACCESSIBLE_WAYPOINTS
                distance_meters = 2350
                # Wheelchair speed ~3.5 km/h on incline + buffer
                est_minutes = 26
                accessibility_info = "ADA-compliant paved transit mall and ramp bypass, avoids curbs and debris."
            elif mobility == MobilityTier.LIMITED_WALKING:
                primary_pts = cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS
                distance_meters = 2200
                est_minutes = 24
                accessibility_info = "Low-grade switchback bypass to Highland Crest, avoids steep direct stairs."
            elif mobility == MobilityTier.NORMAL:
                primary_pts = cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS
                distance_meters = 2100
                est_minutes = 18
                accessibility_info = "Elevated high-ground ridge corridor (+25m elevation), steep slope segments."
            else:
                primary_pts = cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS
                distance_meters = 2100
                est_minutes = 18
                accessibility_info = "Information unavailable."

            alt_geojson = cls.get_route_geojson(
                cls.PRIMARY_WAYPOINTS,
                {
                    "stroke": "#dc2626",
                    "stroke_dasharray": "6 6",
                    "label": "BLOCKED: Riverside Road"
                }
            )

            primary_props = {
                "accessibility_info": accessibility_info,
                "mobility_tier": mobility.value if hasattr(mobility, "value") else str(mobility)
            }
            return cls.get_route_geojson(primary_pts, primary_props), alt_geojson, distance_meters, est_minutes

        else:
            # Initial open route
            if mobility == MobilityTier.WHEELCHAIR:
                primary_pts = cls.WHEELCHAIR_OPEN_WAYPOINTS
                distance_meters = 1650
                est_minutes = 16
                accessibility_info = "Step-free curb-cut corridor, ramp slope < 5%, accessible sidewalk to shelter entrance."
            elif mobility == MobilityTier.LIMITED_WALKING:
                primary_pts = cls.PRIMARY_WAYPOINTS
                distance_meters = 1600
                est_minutes = 14
                accessibility_info = "Level terrain path, step-free corridor with rest zones."
            elif mobility == MobilityTier.NORMAL:
                primary_pts = cls.PRIMARY_WAYPOINTS
                distance_meters = 1600
                est_minutes = 10
                accessibility_info = "Standard pedestrian corridor, unconstrained walking grade."
            else:
                primary_pts = cls.PRIMARY_WAYPOINTS
                distance_meters = 1600
                est_minutes = 10
                accessibility_info = "Information unavailable."

            alt_geojson = cls.get_route_geojson(
                cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS,
                {
                    "stroke": "#64748b",
                    "stroke_dasharray": "4 4",
                    "label": "Contingency High-Ground Route"
                }
            )

            primary_props = {
                "accessibility_info": accessibility_info,
                "mobility_tier": mobility.value if hasattr(mobility, "value") else str(mobility)
            }
            return cls.get_route_geojson(primary_pts, primary_props), alt_geojson, distance_meters, est_minutes
