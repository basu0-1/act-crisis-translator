# ACT — Actionable Crisis Translator (v2.4.0)

> **"Turn emergency information into clear personal decisions."**

[![CI Tests](https://img.shields.io/badge/pytest-35%20passed-brightgreen.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: RBAC](https://img.shields.io/badge/Security-Strict%20RBAC%20(JWT)-blueviolet.svg)]()
[![PDF Documentation](https://img.shields.io/badge/Documentation-PDF%20Available-crimson.svg)](./ACT_System_Documentation.pdf)

---

## 📄 Comprehensive PDF Documentation
A complete technical architecture specification, competitive benchmark analysis, and system documentation is available as a publication-ready PDF:
👉 **[Download ACT_System_Documentation.pdf](./ACT_System_Documentation.pdf)** or find it in [`docs/ACT_System_Documentation_and_Competitive_Analysis.pdf`](./docs/ACT_System_Documentation_and_Competitive_Analysis.pdf).

---

## 🚨 What is ACT?

**ACT (Actionable Crisis Translator)** is an autonomous, personalized emergency decision-support platform. It solves the **"Information Paradox"** in disaster management by translating technical, broadcast-level disaster alerts into immediate, step-free survival directives tailored to individual physical mobility, transport modes, and family companions.

### Key Capabilities & What Makes ACT Best & Unique:
- **Zero-Hallucination Deterministic Engine**: Mathematical rule engines govern all risk calculations, Dijkstra graph routing, and shelter capacity assignments. Generative AI is restricted to structured fact extraction and multilingual translation—preventing lethal hallucinations.
- **Dynamic Roadblock Rerouting**: When a road or bridge floods (e.g. Route C / Highland Blvd), ACT's event engine blacklists the corridor and automatically pivots to an alternative safe path and secondary shelter (`Shelter C - Highland Ridge`).
- **Accessibility-First Routing**: Specialized graph traversal strictly rejects stairs and enforces step-free ramps for wheelchair users and citizens with limited walking mobility.
- **Hyper-Personalized Risk Score**: $Risk = Severity (35\%) \times Exposure (25\%) \times Mobility (25\%) \times Time (15\%)$ producing a calibrated 0–100 score.
- **4-Tier Source Hierarchy**: Level 1 Official (NDMA, IMD, USGS) > Level 2 Sensor Mesh > Level 3 On-Ground Responders > Level 4 Crowdsourced Telemetry.
- **6 Native Languages with Voice Audio**: Instant linguistic switching between **English (`en`)**, **Hindi (`hi`)**, **Bengali (`bn`)**, **Odia (`or`)**, **Urdu (`ur`)**, and **Japanese (`ja`)**, with Web Speech API audio synthesis. Every single word across the UI translates dynamically.
- **ChatGPT-Style Collapsible Sidebar**: Modern AI workspace ergonomics featuring a collapsible/expandable sidebar with quick assessment actions, hazard badges, and bottom user card, paired with a minimal Top Bar and seamless Light/Dark theme switching.
- **Complete Offline Resiliency & Fail-Safe Mode**: Offline caching ensures usability during cellular outages. Missing telemetry triggers conservative vertical shelter-in-place directives.

---

## 📊 Competitive Benchmark: ACT vs Existing Systems

| Capability Dimension | Traditional SMS / TV | Google Public Alerts | FEMA Mobile App | Generic LLM (ChatGPT) | **ACT (This Platform)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Personalized Risk Score** | ❌ None (Broadcast) | ❌ Polygon only | ❌ Static checklist | ⚠️ Inconsistent guess | **✓ Formula-based (0–100)** |
| **Dynamic Roadblock Reroute** | ❌ None | ⚠️ Standard traffic | ❌ Static directory | ❌ No geospatial graph | **✓ Real-time corridor & haven pivot** |
| **Step-Free / Ramp Routing** | ❌ Ignored | ⚠️ Limited street view | ❌ Generic text | ❌ Hallucinates paths | **✓ Guaranteed stair-free validation** |
| **Hallucination Prevention** | ✓ Official text | ✓ Official feeds | ✓ Static content | ❌ Dangerous confabulation | **✓ Zero-Hallucination Engine** |
| **Action Plan Directives** | ❌ Unstructured | ⚠️ Long paragraphs | ⚠️ Static advice | ⚠️ Verbose prose | **✓ DO NOW, NEXT, AVOID + TTS Audio** |
| **Live Shelter Balancing** | ❌ No telemetry | ⚠️ External link | ⚠️ Static directory | ❌ No database state | **✓ Live capacity & slot tracking** |
| **Offline Reliability** | ✓ SMS offline | ❌ Needs web | ⚠️ Cached guides | ❌ Needs cloud API | **✓ Full offline cache + fail-safe** |
| **Linguistic Localization** | ⚠️ 1–2 languages | ✓ Auto-translate | ⚠️ EN / ES only | ✓ Multi-language | **✓ 6 Native Langs (Odia, Bengali...)** |
| **UI Design & Ergonomics** | ❌ Plain text | ⚠️ Search card | ⚠️ Form tabs | ✓ Conversational | **✓ ChatGPT Sidebar + Light/Dark** |

---

## 🏗️ System Architecture & 5-Agent Pipeline

```mermaid
flowchart TD
    subgraph S1["Data Ingestion & 4-Tier Provenance"]
        A1["Level 1: Official Authorities (NDMA, IMD, USGS)"]
        A2["Level 2: Sensors & Stream Gauges"]
        A3["Level 3: Verified On-Ground Responders"]
        A4["Level 4: Crowdsourced Telemetry"]
    end

    subgraph S2["Deterministic Mathematical Engines"]
        E1["Alert Engine\n(4-Tier Hierarchy & Conflict Resolution)"]
        E2["Risk Engine\n(Severity × Exposure × Mobility × Time)"]
        E3["Route Engine\n(Dijkstra Pathfinding & Stair-Free Filter)"]
        E4["Decision Engine\n(Assembly & Fact Verification)"]
    end

    subgraph S3["5-Agent Collaborative AI Pipeline"]
        AG1["Agent 1: Alert Analyst"]
        AG2["Agent 2: Risk Analyst"]
        AG3["Agent 3: Route Analyst"]
        AG4["Agent 4: Action Planner (NOW, NEXT, AVOID, IF→THEN)"]
        AG5["Agent 5: Communication Agent (EN / HI / BN / OR / UR / JA)"]
    end

    subgraph S4["Client Layer (Next.js 14)"]
        UI1["ChatGPT-Style Collapsible Sidebar"]
        UI2["Streamlined Top Bar (Language, Theme, Audit)"]
        UI3["4-Row Minimal Emergency Dashboard"]
        UI4["Dynamic Roadblock Simulation Controls"]
    end

    S1 --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 --> S3
    S3 --> S4
```

---

## 🚀 How to Run the Project Locally

### 1. Start the Backend API (FastAPI)
```powershell
cd C:\Projects\act\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Start the Frontend Web Application (Next.js 14)
```powershell
cd C:\Projects\act\frontend
npm run dev
```
- Interactive Web App: `http://localhost:3000`

### 3. Run Automated Tests
```powershell
cd C:\Projects\act\backend
pytest -v
```
*Current test suite: **35 / 35 passed in 1.31s**.*

---

## 📦 GitHub Update & Push Commands

To commit and push all recent improvements (documentation, PDF, ChatGPT sidebar, multi-language engine) to GitHub:

```powershell
# 1. Navigate to the project directory
cd C:\Projects\act

# 2. Check the status of your branch
git status

# 3. Stage all modified and new files (including docs, PDF, components)
git add -A

# 4. Commit changes with a descriptive message
git commit -m "feat: complete system documentation, competitive benchmark PDF, ChatGPT sidebar, and multi-language engine"

# 5. Push commits to GitHub repository (origin/main)
git push origin main
```

*(Note: When prompted for credentials, use your GitHub username and Personal Access Token).*