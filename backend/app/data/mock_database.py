"""
Mock Database & Deterministic Geodata for ACT Emergency System
"""
import copy
from datetime import datetime, timezone
from typing import Dict, List, Any
from app.schemas.alert import Alert, HazardType, AlertSeverity, AlertCertainty, SourceLevel, SourceProvenance
from app.schemas.user import UserProfile, MobilityType, TransportType, CompanionType, LanguageType
from app.schemas.route import Road, RoadStatus, Shelter, ShelterStatus


# Default Active Flood Alert
DEFAULT_ALERT = Alert(
    id="ALERT-FLD-2026-0891",
    hazard_type=HazardType.FLOOD,
    severity=AlertSeverity.HIGH,
    certainty=AlertCertainty.LIKELY,
    headline="CRITICAL FLASH FLOOD WARNING: Yamuna Basin Sector 4",
    description="Rapid water level rise detected along northern and eastern riverfront zones. Immediate low-lying evacuation ordered for vulnerable populations.",
    lat=28.6139,
    lng=77.2090,
    radius_km=5.0,
    time_to_impact_minutes=32,
    required_action="evacuate",
    source_level=SourceLevel.LEVEL_1_OFFICIAL,
    provenance=SourceProvenance(
        source_name="National Disaster Management Authority (NDMA) & Central Water Commission",
        source_level=SourceLevel.LEVEL_1_OFFICIAL,
        timestamp="2026-09-02T10:15:00Z",
        confidence=0.98,
        verified=True,
        source_url="https://ndma.gov.in/alerts/FLD-2026-0891"
    ),
    created_at="2026-09-02T10:15:00Z",
    active=True
)

# Default Demo User Profile
DEFAULT_USER = UserProfile(
    id="user-demo-01",
    name="Demo User",
    lat=28.6139,
    lng=77.2090,
    language=LanguageType.EN,
    mobility=MobilityType.LIMITED,
    transport=TransportType.WALKING,
    companions=CompanionType.NONE,
    accessibility_requirements=[
        "Step-free access required",
        "Avoid steep inclines (>8%)",
        "Paved pathways only"
    ],
    critical_needs=[
        "Uninterrupted mobility device clearance",
        "Direct shelter reception support"
    ]
)

# Deterministic Road Network
DEFAULT_ROADS: List[Road] = [
    Road(
        id="R1",
        name="North Avenue",
        start_node="USER_HOME",
        end_node="JUNCTION_NORTH",
        status=RoadStatus.SAFE,
        risk_level=0.15,
        accessible_wheelchair=True,
        has_stairs=False,
        travel_time_minutes=8,
        coordinates=[[77.2090, 28.6139], [77.2050, 28.6200]]
    ),
    Road(
        id="R2",
        name="Riverside Road",
        start_node="JUNCTION_NORTH",
        end_node="SHELTER_A",
        status=RoadStatus.FLOODED,
        risk_level=0.90,
        accessible_wheelchair=True,
        has_stairs=False,
        travel_time_minutes=10,
        coordinates=[[77.2050, 28.6200], [77.2000, 28.6250]]
    ),
    Road(
        id="R3",
        name="Highland Boulevard (Route C)",
        start_node="USER_HOME",
        end_node="SHELTER_B",
        status=RoadStatus.SAFE,
        risk_level=0.20,
        accessible_wheelchair=True,
        has_stairs=False,
        travel_time_minutes=14,
        coordinates=[[77.2090, 28.6139], [77.2120, 28.6220], [77.2150, 28.6300]]
    ),
    Road(
        id="R4",
        name="Central Expressway",
        start_node="USER_HOME",
        end_node="JUNCTION_EAST",
        status=RoadStatus.CONGESTED,
        risk_level=0.60,
        accessible_wheelchair=False,
        has_stairs=False,
        travel_time_minutes=22,
        coordinates=[[77.2090, 28.6139], [77.2200, 28.6150], [77.2250, 28.6200]]
    ),
    Road(
        id="R5",
        name="Old Town Stairway Path",
        start_node="JUNCTION_NORTH",
        end_node="SHELTER_B",
        status=RoadStatus.INACCESSIBLE,
        risk_level=0.45,
        accessible_wheelchair=False,
        has_stairs=True,
        travel_time_minutes=6,
        coordinates=[[77.2050, 28.6200], [77.2100, 28.6260], [77.2150, 28.6300]]
    ),
    Road(
        id="R6",
        name="Ridge Connector (Route D)",
        start_node="USER_HOME",
        end_node="SHELTER_C",
        status=RoadStatus.SAFE,
        risk_level=0.25,
        accessible_wheelchair=True,
        has_stairs=False,
        travel_time_minutes=16,
        coordinates=[[77.2090, 28.6139], [77.2180, 28.6250], [77.2250, 28.6400]]
    ),
    Road(
        id="R7",
        name="Hospital Emergency Lane",
        start_node="USER_HOME",
        end_node="HOSPITAL_1",
        status=RoadStatus.SAFE,
        risk_level=0.10,
        accessible_wheelchair=True,
        has_stairs=False,
        travel_time_minutes=12,
        coordinates=[[77.2090, 28.6139], [77.2200, 28.6170], [77.2300, 28.6200]]
    )
]

# Designated Shelters & Critical Facilities
DEFAULT_SHELTERS: List[Shelter] = [
    Shelter(
        id="SHELTER_A",
        name="Shelter A (North Community Center)",
        type="shelter",
        lat=28.6250,
        lng=77.2000,
        capacity=250,
        current_occupancy=210,
        status=ShelterStatus.OPEN,
        is_accessible=True,
        updated_at="10:12:00 UTC",
        address="14 North Riverbank Road, Sector 3"
    ),
    Shelter(
        id="SHELTER_B",
        name="Shelter B (Highland Safe Haven)",
        type="shelter",
        lat=28.6300,
        lng=77.2150,
        capacity=400,
        current_occupancy=120,
        status=ShelterStatus.OPEN,
        is_accessible=True,
        updated_at="10:14:00 UTC",
        address="88 Highland Ridge Avenue, Elevated Zone"
    ),
    Shelter(
        id="SHELTER_C",
        name="Shelter C (Ridge Heights Secondary Facility)",
        type="shelter",
        lat=28.6400,
        lng=77.2250,
        capacity=300,
        current_occupancy=45,
        status=ShelterStatus.OPEN,
        is_accessible=True,
        updated_at="10:10:00 UTC",
        address="102 Ridge Heights Campus"
    ),
    Shelter(
        id="HOSPITAL_1",
        name="City General Emergency Medical Hospital",
        type="hospital",
        lat=28.6200,
        lng=77.2300,
        capacity=150,
        current_occupancy=90,
        status=ShelterStatus.OPEN,
        is_accessible=True,
        updated_at="10:15:00 UTC",
        address="55 Civic Medical Complex"
    )
]


class MockDatabase:
    """In-Memory Thread-Safe Mock Database with Scenario Simulation State"""
    def __init__(self):
        self.reset()

    def reset(self):
        self.alert: Alert = copy.deepcopy(DEFAULT_ALERT)
        self.user: UserProfile = copy.deepcopy(DEFAULT_USER)
        self.roads: Dict[str, Road] = {r.id: copy.deepcopy(r) for r in DEFAULT_ROADS}
        self.shelters: Dict[str, Shelter] = {s.id: copy.deepcopy(s) for s in DEFAULT_SHELTERS}
        self.is_offline: bool = False
        self.cached_plan: Any = None
        self.cached_timestamp: str = "2026-09-02T10:15:00Z"
        self.last_event: str = "System reset to default flood scenario."

    def get_alert(self) -> Alert:
        return self.alert

    def update_alert(self, alert: Alert):
        self.alert = alert

    def get_user(self) -> UserProfile:
        return self.user

    def update_user(self, user: UserProfile):
        self.user = user

    def get_roads(self) -> List[Road]:
        return list(self.roads.values())

    def get_road(self, road_id: str) -> Road:
        return self.roads.get(road_id)

    def update_road_status(self, road_id: str, status: RoadStatus):
        if road_id in self.roads:
            self.roads[road_id].status = status
            if status == RoadStatus.BLOCKED:
                self.roads[road_id].risk_level = 1.0
            elif status == RoadStatus.FLOODED:
                self.roads[road_id].risk_level = 0.95
            elif status == RoadStatus.SAFE:
                self.roads[road_id].risk_level = 0.20

    def get_shelters(self) -> List[Shelter]:
        return list(self.shelters.values())

    def get_shelter(self, shelter_id: str) -> Shelter:
        return self.shelters.get(shelter_id)

    def update_shelter_status(self, shelter_id: str, status: ShelterStatus):
        if shelter_id in self.shelters:
            self.shelters[shelter_id].status = status


# Global singleton database instance
db = MockDatabase()
