export type UserRole = 'END_USER' | 'ADMIN';
export type MobilityTier = 'NORMAL' | 'LIMITED_WALKING' | 'WHEELCHAIR';
export type LanguageCode = 'en' | 'hi' | 'ja';
export type EmergencyType = 'FLOOD' | 'WILDFIRE' | 'EARTHQUAKE' | 'STORM' | 'CHEMICAL_HAZARD';
export type SeverityLevel = 'LOW' | 'MODERATE' | 'SEVERE' | 'EXTREME';
export type CertaintyLevel = 'POSSIBLE' | 'LIKELY' | 'OBSERVED';
export type DataStatus = 'LIVE' | 'DEMO' | 'CACHED' | 'UNAVAILABLE';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ShelterStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'UNAVAILABLE';

export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  preferred_language: LanguageCode;
  mobility: MobilityTier;
  location_name: string;
  location_lat: number;
  location_lon: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  theme: string;
  notifications_enabled: boolean;
  sound_alerts_enabled: boolean;
  high_contrast: boolean;
  offline_cache_enabled: boolean;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface AlertSource {
  id: number;
  name: string;
  source_type: string;
  url?: string;
  is_verified: boolean;
  trust_score: number;
}

export interface EmergencyAlert {
  id: number;
  title: string;
  description: string;
  emergency_type: EmergencyType;
  severity: SeverityLevel;
  certainty: CertaintyLevel;
  hazard_polygon_geojson?: any;
  time_to_impact_minutes: number;
  source_id?: number;
  source?: AlertSource;
  verification_status: string;
  data_status: DataStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskFactorDetail {
  name: string;
  score_impact: number;
  description: string;
  severity_level: string;
}

export interface RiskAssessment {
  id?: number;
  user_id: number;
  alert_id: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_factors: RiskFactorDetail[];
  action_window_minutes: number;
  disclaimer: string;
  created_at: string;
}

export interface Shelter {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity_total: number;
  capacity_available: number;
  wheelchair_accessible: boolean;
  medical_support: boolean;
  pet_friendly: boolean;
  status: ShelterStatus;
  last_verified: string;
  is_active: boolean;
}

export interface RouteEvent {
  id: number;
  route_id: number;
  event_type: string;
  description: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Route {
  id: number;
  user_id: number;
  alert_id: number;
  shelter_id: number;
  shelter?: Shelter;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
  distance_meters: number;
  estimated_time_minutes: number;
  mobility_tier: MobilityTier;
  waypoints_geojson: any;
  alternative_waypoints_geojson?: any;
  is_blocked: boolean;
  blocked_reason?: string;
  events?: RouteEvent[];
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  text: string;
  priority: string;
  category: string;
  icon?: string;
}

export interface IfThenItem {
  id: string;
  condition: string;
  action: string;
  severity: string;
}

export interface ActionPlan {
  id?: number;
  user_id: number;
  alert_id: number;
  do_now: ActionItem[];
  do_next: ActionItem[];
  avoid: ActionItem[];
  if_then: IfThenItem[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyDecisionPackage {
  alert: EmergencyAlert;
  risk: RiskAssessment;
  route: Route;
  shelter: Shelter;
  action_plan: ActionPlan;
  recent_events: RouteEvent[];
}
