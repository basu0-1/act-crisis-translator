# ACT AI Subsystem & Multi-Agent Architecture

## 5-Agent Architecture

```
                       [ RAW TELEMETRY / OFFICIAL WARNING ]
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │   Agent 1: ALERT ANALYST│
                           │   "What is happening?"  │
                           └────────────┬────────────┘
                                        │ (Normalized Alert)
                                        ▼
    [ USER EMERGENCY PROFILE ] ─► ┌─────────────────────────┐
    (Mobility, Transport, Loc)   │   Agent 2: RISK ANALYST │
                                 │ "How does this affect?  │
                                 └────────────┬────────────┘
                                              │ (Risk & Time Pressure)
                                              ▼
    [ ROAD & SHELTER GRAPH ] ───► ┌─────────────────────────┐
    (Barrier & Stair Filters)     │  Agent 3: ROUTE ANALYST │
                                 │ "Where can they go?"    │
                                 └────────────┬────────────┘
                                              │ (Safe Accessible Path)
                                              ▼
                                 ┌─────────────────────────┐
                                 │ Agent 4: ACTION PLANNER │
                                 │  "What should they do?" │
                                 └────────────┬────────────┘
                                              │ (Strict Structured Facts)
                                              ▼
                                 ┌─────────────────────────┐
                                 │ Agent 5: COMMUNICATION  │
                                 │   "How to communicate?" │
                                 └────────────┬────────────┘
                                              │ (EN / HI / JA)
                                              ▼
                                 [ PERSONALIZED ACTION PLAN ]
```

## Zero Hallucination Safety Guarantee
1. **Rule Engine Isolation**: All road accessibility, risk scores, and shelter capacities are calculated deterministically.
2. **Fact Injection**: The AI Planner only structures and personalizes verified facts.
3. **Fail-Safe Mechanism**: Missing data automatically surfaces `⚠️ INSUFFICIENT INFORMATION` and activates vertical sheltering advice.