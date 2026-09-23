export type HazardType = "flood" | "wildfire" | "cyclone" | "earthquake" | "extreme_heat" | "urban_emergency";
export type AlertSeverity = "low" | "medium" | "high" | "extreme";
export type AlertCertainty = "possible" | "likely" | "observed";
export type SourceLevel = 1 | 2 | 3 | 4;

export interface SourceProvenance {
  source_name: string;
  source_level: SourceLevel;
  timestamp: string;
  confidence: number;
  verified: boolean;
  source_url?: string;
}

export interface Alert {
  id: string;
  hazard_type: HazardType;
  severity: AlertSeverity;
  certainty: AlertCertainty;
  headline: string;
  description: string;
  lat: number;
  lng: number;
  radius_km: number;
  time_to_impact_minutes: number;
  required_action: string;
  source_level: SourceLevel;
  provenance: SourceProvenance;
  created_at: string;
  active: boolean;
}

export type MobilityType = "normal" | "limited" | "wheelchair";
export type TransportType = "walking" | "bicycle" | "car" | "public_transport";
export type CompanionType = "none" | "child" | "elderly" | "pet";
export type LanguageType = "en" | "hi" | "ja" | "bn" | "or" | "ur";

export interface UserProfile {
  id: string;
  name: string;
  lat: number;
  lng: number;
  language: LanguageType;
  mobility: MobilityType;
  transport: TransportType;
  companions: CompanionType;
  accessibility_requirements: string[];
  critical_needs: string[];
}

export type RoadStatus = "safe" | "flooded" | "blocked" | "congested" | "inaccessible";
export type ShelterStatus = "open" | "full" | "closed" | "unavailable";

export interface Road {
  id: string;
  name: string;
  start_node: string;
  end_node: string;
  status: RoadStatus;
  risk_level: number;
  accessible_wheelchair: boolean;
  has_stairs: boolean;
  travel_time_minutes: number;
  coordinates: [number, number][];
}

export interface Shelter {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  capacity: number;
  current_occupancy: number;
  status: ShelterStatus;
  is_accessible: boolean;
  updated_at: string;
  address: string;
}

export interface RouteStep {
  instruction: string;
  road_name: string;
  distance_meters: number;
  estimated_seconds: number;
  warning?: string;
}

export interface RouteOption {
  route_id: string;
  name: string;
  destination_id: string;
  destination_name: string;
  total_distance_km: number;
  estimated_time_minutes: number;
  safety_score: number;
  is_accessible: boolean;
  has_stairs: boolean;
  status: RoadStatus;
  steps: RouteStep[];
  path_coordinates: [number, number][];
}

export interface RouteRecommendation {
  recommended_route: RouteOption | null;
  destination: Shelter | null;
  destination_type: string;
  estimated_time_minutes: number;
  safety_score: number;
  reasons: string[];
  rejected_routes: { road_id?: string; road_name?: string; shelter_id?: string; reason: string }[];
  all_routes: RouteOption[];
  status: string;
}

export type RiskLevel = "low" | "medium" | "high" | "extreme";

export interface RiskBreakdownItem {
  factor: string;
  weight: number;
  contribution: number;
  explanation: string;
  satisfied: boolean;
}

export interface PersonalRisk {
  score: number;
  level: RiskLevel;
  estimated_action_window_minutes: number;
  reasons: string[];
  breakdown: RiskBreakdownItem[];
  prototype_disclaimer: string;
}

export interface IfThenRule {
  condition: string;
  action: string;
  trigger_event: string;
}

export interface ActionPlan {
  plan_id: string;
  timestamp: string;
  language: LanguageType;
  hazard: string;
  risk_score: number;
  risk_level: string;
  action_window_minutes: number;
  destination_shelter: string;
  route_summary: string;
  now: string[];
  next: string[];
  avoid: string[];
  if_then: IfThenRule[];
  source_provenance: SourceProvenance;
  is_cached?: boolean;
  offline_ready?: boolean;
  disclaimer: string;
  failsafe_status?: string;
  failsafe_reason?: string;
}

export interface SimulationState {
  alert: Alert;
  user: UserProfile;
  roads: Road[];
  shelters: Shelter[];
  risk: PersonalRisk;
  route_recommendation: RouteRecommendation;
  action_plan: ActionPlan;
  is_offline: boolean;
  last_event_description: string;
}