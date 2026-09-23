# ACT 5-Agent AI Pipeline & Safety Guard Architecture

```
                    ┌───────────────────────────────────────┐
                    │               RAW ALERT               │
                    └───────────────────┬───────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │  Agent 1: ALERT ANALYST                                               │
    │  Input: Raw Emergency Alert text / CAP XML                            │
    │  Output: Strict normalized schema (Hazard, Severity, Time, Source)   │
    └───────────────────────────────────┬───────────────────────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │  Agent 2: RISK ANALYST                                                │
    │  Input: Alert + Personal Profile (Mobility, Location, Companions)     │
    │  Output: Personalized Risk Score (0-100), Action Window, Rationale    │
    └───────────────────────────────────┬───────────────────────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │  Agent 3: ROUTE ANALYST                                               │
    │  Input: Road Network + Shelter Registry + Mobility Constraints        │
    │  Output: Barrier-free Safe Route, Destination Shelter, Rejections     │
    └───────────────────────────────────┬───────────────────────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │  Agent 4: ACTION PLANNER                                              │
    │  Input: STRICT VERIFIED FACTS ONLY                                    │
    │  Output: Unambiguous DO NOW, NEXT, AVOID, and IF -> THEN Directives   │
    └───────────────────────────────────┬───────────────────────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │  Agent 5: COMMUNICATION AGENT                                         │
    │  Input: Structured Action Plan + Target Language (EN, HI, JA)         │
    │  Output: Localized, simplified emergency communication                │
    └───────────────────────────────────────────────────────────────────────┘
```

## Strict AI Safety Rules
1. **Never Invent Data**: If a road condition or shelter is unknown, the model must NOT guess.
2. **Deterministic Precedence**: All routing weights and risk calculations are deterministic. The LLM acts purely as an instruction synthesizer and translator.
3. **Fail-Safe Response**: When safe routing cannot be mathematically proven, the system switches to vertical in-place sheltering directives (`⚠️ INSUFFICIENT INFORMATION`).