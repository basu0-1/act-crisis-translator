"""
API: Route & Geospatial Recalculation
"""
from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas.route import Road, Shelter, RouteRecommendation
from app.data.mock_database import db
from app.agents.route_analyst import RouteAnalystAgent

router = APIRouter(prefix="/route", tags=["Routing & Shelters"])


@router.post("/recalculate", response_model=RouteRecommendation)
def recalculate_route():
    roads = db.get_roads()
    shelters = db.get_shelters()
    user = db.get_user()
    return RouteAnalystAgent.analyze(roads, shelters, user)


@router.get("/roads", response_model=List[Road])
def get_roads():
    return db.get_roads()


@router.get("/shelters", response_model=List[Shelter])
def get_shelters():
    return db.get_shelters()


@router.get("/geojson")
def get_geojson_layers() -> Dict[str, Any]:
    """Generates complete GeoJSON feature collections for Map rendering"""
    roads = db.get_roads()
    shelters = db.get_shelters()
    user = db.get_user()
    alert = db.get_alert()

    # User Feature
    user_feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [user.lng, user.lat]
        },
        "properties": {
            "id": user.id,
            "name": user.name,
            "type": "user",
            "mobility": user.mobility.value
        }
    }

    # Hazard Circle/Polygon
    hazard_feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [alert.lng, alert.lat]
        },
        "properties": {
            "id": alert.id,
            "type": "hazard_epicenter",
            "radius_km": alert.radius_km,
            "severity": alert.severity.value,
            "hazard_type": alert.hazard_type.value
        }
    }

    # Road LineStrings
    road_features = []
    for r in roads:
        if r.coordinates:
            road_features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": r.coordinates
                },
                "properties": {
                    "id": r.id,
                    "name": r.name,
                    "status": r.status.value,
                    "risk_level": r.risk_level,
                    "has_stairs": r.has_stairs,
                    "accessible_wheelchair": r.accessible_wheelchair
                }
            })

    # Shelter Points
    shelter_features = []
    for s in shelters:
        shelter_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s.lng, s.lat]
            },
            "properties": {
                "id": s.id,
                "name": s.name,
                "type": s.type,
                "capacity": s.capacity,
                "occupancy": s.current_occupancy,
                "available": s.capacity - s.current_occupancy,
                "status": s.status.value,
                "accessible": s.is_accessible
            }
        })

    return {
        "user": user_feature,
        "hazard": hazard_feature,
        "roads": {"type": "FeatureCollection", "features": road_features},
        "shelters": {"type": "FeatureCollection", "features": shelter_features}
    }
