# ACT Hackathon Live Demo Walkthrough

Follow this exact story to demonstrate the **WOW moment** to judges in under 2 minutes:

---

### Step 1: Initial State (High Risk & Barrier-Aware Routing)
- **Open ACT Dashboard**: `http://localhost:3000`
- **Show Initial Context**:
  - **User Profile**: Demo User with **Limited Mobility** (walking pace, requires step-free paths).
  - **Emergency Alert**: Critical Flash Flood Warning (High Severity, 32 mins to impact).
  - **Personal Risk**: **82 / 100 (HIGH RISK)** with transparent explainability checklist.
  - **Recommended Route**: **Route C (Highland Blvd)** $\rightarrow$ **Shelter B (Highland Safe Haven)**.
  - **Action Plan**:
    - **DO NOW**: Move away from ground-level areas; secure mobility aid.
    - **AVOID**: Riverside Road (flooded).

---

### Step 2: The Core WOW Moment — Road Blockage Trigger
- On the **Live Scenario Control Panel**, click **"Highland Blvd: BLOCK"**.
- Observe the instant visual feedback:
  - 🚨 **EVENT DETECTED: RECALCULATING ROUTE...**
  - **Route C** is marked unavailable.
  - **ACT instantly recalculates**: New accessible evacuation route switches to **Ridge Connector (Route D)** leading to **Shelter C (Ridge Heights)**.
  - **Action Plan & Map Update Dynamically**: The AVOID list and IF-THEN rules immediately reflect the new hazard topography.

---

### Step 3: Mobility Profile Switch (Stair Rejection)
- On the **Mobility Constraint** section, toggle **Limited Walking** to **Wheelchair**.
- The system verifies that routes with stairs or narrow sidewalks remain strictly rejected, ensuring 100% barrier-free passage.

---

### Step 4: Multilingual Translation
- Click the language selector: **English $\rightarrow$ हिन्दी $\rightarrow$ 日本語**.
- Observe the action plan dynamically translate with zero loss of verified factual details.

---

### Step 5: Offline Mode Simulation
- Click **"Simulate Offline Mode"**.
- Observe the top amber banner: **"🟠 CONNECTION LOST — Showing last verified emergency action plan."**
- Demonstrate that all cached directives remain fully accessible even with zero internet connectivity.