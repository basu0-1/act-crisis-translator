"""
Agent 3: Route Analyst
Question: "Where can THIS person safely go?"
Computes graph-based accessibility-aware evacuation routes.
"""
from typing import List, Dict, Any
from app.schemas.user import UserProfile
from app.schemas.route import Road, Shelter, RouteRecommendation
from app.engines.route_engine import RouteEngine


class RouteAnalystAgent:
    """Agent 3: Identifies safe, barrier-free routing avoiding flood zones and stairs"""

    @classmethod
    def analyze(
        cls,
        roads: List[Road],
        shelters: List[Shelter],
        user: UserProfile
    ) -> RouteRecommendation:
        return RouteEngine.calculate_best_route(roads, shelters, user)
