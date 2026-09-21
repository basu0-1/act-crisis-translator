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
    def get_route_geojson(cls, waypoints: List[List[float]]) -> Dict[str, Any]:
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": waypoints
            },
            "properties": {
                "stroke": "#2563eb",
                "stroke_width": 5,
                "stroke_opacity": 0.9
            }
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
            elif mobility == MobilityTier.LIMITED_WALKING:
                primary_pts = cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS
                distance_meters = 2200
                est_minutes = 24
            else:
                primary_pts = cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS
                distance_meters = 2100
                est_minutes = 18

            # The original blocked route becomes the alternative visual marker
            alt_geojson = cls.get_route_geojson(cls.PRIMARY_WAYPOINTS)
            alt_geojson["properties"]["stroke"] = "#dc2626"
            alt_geojson["properties"]["stroke_dasharray"] = "6 6"
            alt_geojson["properties"]["label"] = "BLOCKED: Riverside Road"

            return cls.get_route_geojson(primary_pts), alt_geojson, distance_meters, est_minutes

        else:
            # Initial open route
            primary_pts = cls.PRIMARY_WAYPOINTS
            distance_meters = 1600

            if mobility == MobilityTier.WHEELCHAIR:
                est_minutes = 16
            elif mobility == MobilityTier.LIMITED_WALKING:
                est_minutes = 14
            else:
                est_minutes = 10

            alt_geojson = cls.get_route_geojson(cls.ALTERNATIVE_HIGH_GROUND_WAYPOINTS)
            alt_geojson["properties"]["stroke"] = "#64748b"
            alt_geojson["properties"]["stroke_dasharray"] = "4 4"
            alt_geojson["properties"]["label"] = "Contingency High-Ground Route"

            return cls.get_route_geojson(primary_pts), alt_geojson, distance_meters, est_minutes
