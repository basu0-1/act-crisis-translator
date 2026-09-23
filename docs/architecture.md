# ACT System Architecture & Engineering Design (v1.1.0)

> **Actionable Crisis Translator — Emergency Decision-Support Platform**

---

## 1. High-Level System Architecture

ACT follows a strict decoupling between **Data Ingestion**, **Deterministic Rule Engines**, an **Agentic Decision Pipeline**, and a **Reactive Web Client**.

```mermaid
graph TB
    subgraph INGESTION["1. Multi-Source Ingestion & Provenance"]
        CAP["CAP / NDMA Official Alerts\n(Level 1)"]
        SENSORS["Hydrological & Seismic Sensors\n(Level 2)"]
        RESPONDERS["Field Responders\n(Level 3)"]
        CROWD["Crowdsourced Reports\n(Level 4)"]
    end

    subgraph SECURITY["2. Persistence & RBAC Security Layer"]
        AUTH["FastAPI Auth & PyJWT\n(HS256)"]
        DB[(SQLAlchemy ORM\nPostgreSQL / SQLite)]
        AUDIT["Audit Ledger\n(Immutable Security Log)"]
    end

    subgraph ENGINES["3. Deterministic Decision Engines (Zero-Hallucination)"]
        AE["Alert Engine\n(Hierarchy Conflict Resolver)"]
        RE["Risk Engine\n(Multi-Factor Personal Risk)"]
        RO["Route Engine\n(NetworkX Dijkstra & Barrier Filter)"]
        DE["Decision Engine\n(Verified Fact Assembly)"]
    end

    subgraph AGENTS["4. 5-Agent Collaborative AI Pipeline"]
        A1["Agent 1: Alert Analyst"]
        A2["Agent 2: Risk Analyst"]
        A3["Agent 3: Route Analyst"]
        A4["Agent 4: Action Planner"]
        A5["Agent 5: Communication Agent"]
    end

    subgraph CLIENT["5. Next.js 14 Client Experience"]
        LANDING["Landing Page (Screenshot Spec)"]
        DASH["7-Step Decision Dashboard"]
        MAP["Vector Tactical Evacuation Map"]
        SIM["Interactive Roadblock Drawer"]
    end

    INGESTION --> AE
    SECURITY <--> ENGINES
    AE --> RE
    RE --> RO
    RO --> DE
    DE --> AGENTS
    AGENTS --> CLIENT
```

---

## 2. 4-Tier Source Hierarchy & Conflict Resolution

Emergency situations frequently suffer from conflicting alerts (e.g., social media reports claiming water has receded while civil defense has ordered an evacuation). ACT resolves this using a strict trust priority ladder:

```mermaid
flowchart TD
    A["Incoming Emergency Reports"] --> B{"Conflict Detected?"}
    B -- No --> C["Direct Processing"]
    B -- Yes --> D["Compare Source Trust Levels"]
    
    D --> E["Level 1: Official Emergency Authorities\n(NDMA, IMD, USGS, Civil Defense)\nConfidence: 0.98 | Absolute Authority"]
    D --> F["Level 2: Trusted Infrastructure\n(Automated River Gauges, Seismic Sensors)\nConfidence: 0.90"]
    D --> G["Level 3: Verified On-Ground Responders\n(Red Cross, Fire Dispatch, Police Units)\nConfidence: 0.80"]
    D --> H["Level 4: Crowdsourced / Citizen Reports\n(Unconfirmed Social Posts)\nConfidence: 0.45 | Provisional"]

    E --> I["Higher Level Automatically Overrides Lower Level"]
    F --> I
    G --> I
    H --> I
    I --> J{"Tiebreak on Same Level?"}
    J --> K["Latest Timestamp + Higher Confidence Score Wins"]
    K --> L["Output Verified Alert to Engines"]
```

---

## 3. Dynamic Roadblock & Route Recalculation Flow

When an active evacuation route becomes obstructed (e.g., flash flood inundating Highland Boulevard), ACT executes instant real-time graph recalculation without application crashes:

```mermaid
stateDiagram-v2
    [*] --> PrimaryRouteActive: System Initialized
    PrimaryRouteActive --> RoadblockDetected: Flooding or Obstruction Event (R3)
    
    state RoadblockDetected {
        [*] --> InvalidateEdge: Mark Road R3 as BLOCKED
        InvalidateEdge --> ExcludeBarriers: Filter Out Inaccessible Roads (Stairs for Wheelchairs)
        ExcludeBarriers --> GraphSearch: NetworkX Dijkstra Shortest Weighted Path
        GraphSearch --> AssignShelter: Re-route to Alternative Shelter (Shelter C)
    }
    
    RoadblockDetected --> RecalculatedRouteReady: Alternative Safe Haven Found
    RoadblockDetected --> FailSafeTriggered: All Paths Inundated / Blocked
    
    RecalculatedRouteReady --> UpdateActionPlan: Hero Actions updated to DO NOW: Divert
    FailSafeTriggered --> VerticalRefuge: Issue Shelter-in-Place & Signal Distress
```

---

## 4. Multi-Emergency Risk Model

The prototype decision-support score is calculated transparently using an explainable multi-factor formula:

$$\text{Composite Score} = (0.35 \times S) + (0.25 \times E) + (0.25 \times V) + (0.15 \times T)$$

Where:
- **$S$ (Severity Factor)**: Extreme ($1.0$), High ($0.85$), Medium ($0.50$), Low ($0.25$).
- **$E$ (Exposure Factor)**: Haversine distance from epicenter vs hazard radius. Conservative fallback ($0.60$) if spatial boundaries are unverified.
- **$V$ (Vulnerability Factor)**:
  - Mobility: Wheelchair ($0.95$), Limited Walking ($0.80$), Normal ($0.50$).
  - Transport: Walking ($0.85$), Bicycle ($0.65$), Transit ($0.60$), Car ($0.40$).
  - Hazard Modifiers: Inhalation risk in Wildfire ($+0.10$), Heat stress in Extreme Heat ($+0.12$), High wind exposure in Cyclone ($+0.10$).
- **$T$ (Time Pressure Factor)**: Time to impact remaining ($<15$ mins = $1.0$, $<30$ mins = $0.85$, etc.).

---

## 5. Fail-Safe Missing Information Handling

In accordance with strict life-safety design guidelines:
1. **Never Hallucinate**: If road network data, shelter status, or GPS telemetry is unavailable, ACT explicitly displays `"Information unavailable."` and sets `failsafe_status="⚠️ INSUFFICIENT INFORMATION"`.
2. **Defensive Guidance**: When no safe ground route can be mathematically guaranteed, the platform instructs citizens to cease lowland transit, seek upper-level vertical refuge inside the nearest sturdy building, and signal distress to official responders.