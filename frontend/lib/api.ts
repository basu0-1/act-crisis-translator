import {
  Alert,
  UserProfile,
  PersonalRisk,
  RouteRecommendation,
  ActionPlan,
  SimulationState,
  LanguageType,
  MobilityType,
  RoadStatus
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CACHE_KEY = "act_emergency_cached_plan";
const CACHE_STATE_KEY = "act_emergency_cached_state";

export async function fetchSimulationState(): Promise<SimulationState> {
  try {
    const res = await fetch(`${API_BASE}/simulate/state`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: SimulationState = await res.json();
    
    // Save locally for offline cache fallback
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_STATE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.action_plan));
    }
    return data;
  } catch (err) {
    console.warn("API unavailable, reading from offline cache:", err);
    return getOfflineCachedState();
  }
}

export async function triggerSimulationEvent(event: {
  event_type: string;
  road_id?: string;
  new_road_status?: RoadStatus;
  mobility?: MobilityType;
  severity?: string;
  time_to_impact_minutes?: number;
  is_offline?: boolean;
  language?: LanguageType;
  shelter_id?: string;
}): Promise<SimulationState> {
  try {
    const res = await fetch(`${API_BASE}/simulate/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: SimulationState = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_STATE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.action_plan));
    }
    return data;
  } catch (err) {
    console.warn("Simulation API offline fallback:", err);
    return getOfflineCachedState();
  }
}

export async function resetSimulation(): Promise<SimulationState> {
  try {
    const res = await fetch(`${API_BASE}/simulate/reset`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: SimulationState = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_STATE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.action_plan));
    }
    return data;
  } catch (err) {
    return getOfflineCachedState();
  }
}

export async function updateLanguage(lang: LanguageType): Promise<SimulationState> {
  return triggerSimulationEvent({
    event_type: "language_changed",
    language: lang,
  });
}

export function getOfflineCachedState(): SimulationState {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(CACHE_STATE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        parsed.is_offline = true;
        parsed.last_event_description = "⚠️ OFFLINE MODE: Serving verified cached emergency plan.";
        if (parsed.action_plan) parsed.action_plan.is_cached = true;
        return parsed;
      } catch (e) {}
    }
  }

  // Built-in fail-safe static fallback
  return {
    alert: {
      id: "ALERT-FLD-CACHED",
      hazard_type: "flood",
      severity: "high",
      certainty: "likely",
      headline: "CRITICAL FLASH FLOOD WARNING: Sector 4 (Offline Cache)",
      description: "Water level rise reported along northern basin.",
      lat: 28.6139,
      lng: 77.2090,
      radius_km: 5,
      time_to_impact_minutes: 32,
      required_action: "evacuate",
      source_level: 1,
      provenance: {
        source_name: "NDMA Official Emergency Broadcast",
        source_level: 1,
        timestamp: "2026-09-02T10:15:00Z",
        confidence: 0.98,
        verified: true,
      },
      created_at: "2026-09-02T10:15:00Z",
      active: true,
    },
    user: {
      id: "demo_user_01",
      name: "Demo User",
      lat: 28.6139,
      lng: 77.2090,
      language: "en",
      mobility: "limited",
      transport: "walking",
      companions: "none",
      accessibility_requirements: ["Step-free access", "Avoid steep inclines"],
      critical_needs: ["Prescription medication kit"],
    },
    roads: [],
    shelters: [],
    risk: {
      score: 82,
      level: "high",
      estimated_action_window_minutes: 32,
      reasons: [
        "High hazard severity (FLOOD)",
        "User inside affected zone",
        "Limited mobility",
        "Short evacuation window (32 mins)",
      ],
      breakdown: [],
      prototype_disclaimer: "Prototype decision-support score",
    },
    route_recommendation: {
      recommended_route: {
        route_id: "R3",
        name: "Highland Boulevard (Route C)",
        destination_id: "SHELTER_B",
        destination_name: "Shelter B (Highland Safe Haven)",
        total_distance_km: 1.8,
        estimated_time_minutes: 14,
        safety_score: 85,
        is_accessible: true,
        has_stairs: false,
        status: "safe",
        steps: [],
        path_coordinates: [[77.2090, 28.6139], [77.2150, 28.6300]],
      },
      destination: {
        id: "SHELTER_B",
        name: "Shelter B (Highland Safe Haven)",
        type: "shelter",
        lat: 28.6300,
        lng: 77.2150,
        capacity: 400,
        current_occupancy: 120,
        status: "open",
        is_accessible: true,
        updated_at: "10:14:00 UTC",
        address: "88 Highland Ridge Avenue",
      },
      destination_type: "shelter",
      estimated_time_minutes: 14,
      safety_score: 85,
      reasons: ["Accessible route avoiding flooded roads and stairs"],
      rejected_routes: [{ reason: "Riverside Road: Flooded (90% risk)" }],
      all_routes: [],
      status: "available",
    },
    action_plan: {
      plan_id: "PLAN-OFFLINE-01",
      timestamp: new Date().toISOString(),
      language: "en",
      hazard: "flood",
      risk_score: 82,
      risk_level: "high",
      action_window_minutes: 32,
      destination_shelter: "Shelter B (Highland Safe Haven)",
      route_summary: "Highland Boulevard (Route C) → Shelter B (14 min, step-free)",
      now: [
        "Move away from ground-level areas immediately.",
        "Secure personal mobility device and prescription medication.",
        "Begin step-free evacuation toward Shelter B."
      ],
      next: [
        "Take government ID, phone, and emergency contact list.",
        "Report to reception at Shelter B upon arrival."
      ],
      avoid: [
        "Do NOT use Riverside Road (confirmed flooded).",
        "Avoid stairs and low-lying underpasses."
      ],
      if_then: [
        {
          condition: "If Highland Boulevard becomes blocked",
          action: "Switch immediately to Ridge Connector toward Shelter C",
          trigger_event: "Road Blockage"
        }
      ],
      source_provenance: {
        source_name: "NDMA Official Emergency Broadcast",
        source_level: 1,
        timestamp: "2026-09-02T10:15:00Z",
        confidence: 0.98,
        verified: true,
      },
      is_cached: true,
      offline_ready: true,
      disclaimer: "ACT provides personalized emergency guidance based on verified data.",
    },
    is_offline: true,
    last_event_description: "Offline cache active. Showing last verified action plan.",
  };
}

export async function recordUserTimelineEvent(
  eventText: string,
  eventType = "recalculation",
  userId = "demo_user_01"
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/user/timeline-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        event_text: eventText,
        event_type: eventType,
      }),
    });
  } catch (e) {
    console.warn("Could not persist timeline event to DB:", e);
  }
}