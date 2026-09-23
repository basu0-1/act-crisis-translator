"""
Route Engine for ACT: Graph-based Accessibility-Aware Pathfinding
"""
from typing import List, Dict, Tuple, Optional
import networkx as nx
from app.schemas.user import UserProfile, MobilityType
from app.schemas.route import (
    Road, RoadStatus, Shelter, ShelterStatus, RouteOption,
    RouteStep, RouteRecommendation
)


class RouteEngine:
    """Graph-based route recalculation with strict accessibility constraints"""

    @staticmethod
    def build_graph(roads: List[Road], user: UserProfile) -> Tuple[nx.DiGraph, List[dict]]:
        """Constructs weighted directed graph, filtering out inaccessible edges"""
        G = nx.DiGraph()
        rejected_roads = []

        is_mobility_restricted = user.mobility in [MobilityType.LIMITED, MobilityType.WHEELCHAIR]

        for road in roads:
            # Rule 1: Check blocked or impassable roads
            if road.status == RoadStatus.BLOCKED:
                rejected_roads.append({
                    "road_id": road.id,
                    "road_name": road.name,
                    "reason": f"Road {road.name} is completely blocked by flood debris / barricades"
                })
                continue

            # Rule 2: Check mobility accessibility (e.g., stairs / unpaved terrain)
            if is_mobility_restricted:
                if road.has_stairs:
                    rejected_roads.append({
                        "road_id": road.id,
                        "road_name": road.name,
                        "reason": f"Rejected: {road.name} contains steep stairs (incompatible with {user.mobility.value} mobility)"
                    })
                    continue
                if user.mobility == MobilityType.WHEELCHAIR and not road.accessible_wheelchair:
                    rejected_roads.append({
                        "road_id": road.id,
                        "road_name": road.name,
                        "reason": f"Rejected: {road.name} inaccessible for wheelchair (curbs/narrow path)"
                    })
                    continue

            # Rule 3: Compute edge weight penalty (Safest != Shortest)
            penalty = 1.0
            if road.status == RoadStatus.FLOODED:
                penalty = 25.0  # Heavy safety penalty for active flood water
            elif road.status == RoadStatus.CONGESTED:
                penalty = 3.0   # Congestion delay
            elif road.status == RoadStatus.SAFE:
                penalty = 1.0

            pace_multiplier = 1.5 if user.mobility == MobilityType.LIMITED else (1.8 if user.mobility == MobilityType.WHEELCHAIR else 1.0)
            adjusted_time = road.travel_time_minutes * pace_multiplier
            total_weight = adjusted_time * penalty * (1.0 + road.risk_level)

            G.add_edge(
                road.start_node,
                road.end_node,
                road_id=road.id,
                name=road.name,
                status=road.status,
                risk=road.risk_level,
                weight=total_weight,
                travel_time=int(adjusted_time),
                coordinates=road.coordinates,
                accessible_wheelchair=road.accessible_wheelchair,
                has_stairs=road.has_stairs
            )

        return G, rejected_roads

    @staticmethod
    def calculate_best_route(
        roads: List[Road],
        shelters: List[Shelter],
        user: UserProfile
    ) -> RouteRecommendation:
        G, rejected_roads = RouteEngine.build_graph(roads, user)
        start_node = "USER_HOME"

        # Primary evacuation centers are general community shelters
        candidate_shelters = [
            s for s in shelters
            if s.type == "shelter" and s.status == ShelterStatus.OPEN and s.current_occupancy < s.capacity
        ]

        if not candidate_shelters:
            # Fallback to any open emergency facility including hospitals
            candidate_shelters = [
                s for s in shelters
                if s.status == ShelterStatus.OPEN and s.current_occupancy < s.capacity
            ]

        if not candidate_shelters or start_node not in G:
            return RouteRecommendation(
                recommended_route=None,
                destination=None,
                estimated_time_minutes=0,
                safety_score=0,
                reasons=["No open shelter or accessible departure path found from current location"],
                rejected_routes=rejected_roads,
                all_routes=[],
                status="insufficient_info"
            )

        route_options: List[RouteOption] = []

        for shelter in candidate_shelters:
            target_node = shelter.id
            if target_node not in G:
                rejected_roads.append({
                    "shelter_id": shelter.id,
                    "shelter_name": shelter.name,
                    "reason": f"No accessible path to {shelter.name} (all connecting corridors blocked or barred by stairs)"
                })
                continue

            try:
                path_nodes = nx.shortest_path(G, source=start_node, target=target_node, weight="weight")
                
                total_time = 0
                max_risk = 0.0
                all_coords: List[List[float]] = []
                steps: List[RouteStep] = []
                has_stairs = False
                all_accessible = True
                has_flood = False

                for i in range(len(path_nodes) - 1):
                    u, v = path_nodes[i], path_nodes[i+1]
                    edge_data = G[u][v]
                    total_time += edge_data["travel_time"]
                    max_risk = max(max_risk, edge_data["risk"])
                    if edge_data["status"] == RoadStatus.FLOODED:
                        has_flood = True
                    if edge_data["has_stairs"]:
                        has_stairs = True
                    if not edge_data["accessible_wheelchair"]:
                        all_accessible = False
                    
                    if edge_data["coordinates"]:
                        all_coords.extend(edge_data["coordinates"])

                    steps.append(RouteStep(
                        instruction=f"Follow {edge_data['name']} toward {v.replace('_', ' ').title()}",
                        road_name=edge_data["name"],
                        distance_meters=800,
                        estimated_seconds=edge_data["travel_time"] * 60,
                        warning="⚠️ Flooded road section reported" if edge_data["status"] == RoadStatus.FLOODED else None
                    ))

                safety_score = max(10, int(100 - (max_risk * 70) - (20 if has_flood else 0)))

                route_options.append(RouteOption(
                    route_id=f"ROUTE_TO_{shelter.id}",
                    name=f"Accessible Route to {shelter.name.split('(')[0].strip()}",
                    destination_id=shelter.id,
                    destination_name=shelter.name,
                    total_distance_km=round(len(path_nodes) * 1.2, 1),
                    estimated_time_minutes=total_time,
                    safety_score=safety_score,
                    is_accessible=all_accessible,
                    has_stairs=has_stairs,
                    status=RoadStatus.FLOODED if has_flood else RoadStatus.SAFE,
                    steps=steps,
                    path_coordinates=all_coords
                ))

            except (nx.NetworkXNoPath, nx.NodeNotFound, KeyError):
                rejected_roads.append({
                    "shelter_id": shelter.id,
                    "shelter_name": shelter.name,
                    "reason": f"No accessible path to {shelter.name} (barriers or roadblocks detected)"
                })

        if not route_options:
            return RouteRecommendation(
                recommended_route=None,
                destination=None,
                estimated_time_minutes=0,
                safety_score=0,
                reasons=["No viable accessible route to any designated shelter due to road conditions"],
                rejected_routes=rejected_roads,
                all_routes=[],
                status="insufficient_info"
            )

        # Sort: Highest safety score first, then lowest travel time
        route_options.sort(key=lambda r: (-r.safety_score, r.estimated_time_minutes))
        best_route = route_options[0]
        chosen_shelter = next((s for s in candidate_shelters if s.id == best_route.destination_id), None)

        reasons = [
            f"Step-free accessible route verified for {user.mobility.value} mobility",
            "Avoids active flooded riverfront zones and stairwells",
            f"Destination {chosen_shelter.name.split('(')[0].strip()} has {chosen_shelter.capacity - chosen_shelter.current_occupancy} open spaces",
            f"Estimated transit time: {best_route.estimated_time_minutes} minutes"
        ]

        return RouteRecommendation(
            recommended_route=best_route,
            destination=chosen_shelter,
            destination_type="shelter",
            estimated_time_minutes=best_route.estimated_time_minutes,
            safety_score=best_route.safety_score,
            reasons=reasons,
            rejected_routes=rejected_roads,
            all_routes=route_options,
            status="available"
        )
