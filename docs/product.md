# ACT — Actionable Crisis Translator: Product Specification

## 1. Product Vision & Philosophy
**Tagline:** *"From Emergency Warnings to Personal Action."*

Traditional emergency systems broadcast broad announcements (e.g., *"Flash flood warning in Yamuna basin"*). For an individual citizen—especially a person with limited mobility or a wheelchair user—this general broadcast lacks the crucial personal context:
- *Am I directly in harm’s way?*
- *How much time do I actually have?*
- *Can I reach the designated shelter without encountering stairs or deep floodwaters?*
- *What must I do NOW, what should I do NEXT, and what must I strictly AVOID?*

**ACT is not a disaster predictor, not an emergency chatbot, and not a replacement for official authorities.**  
ACT is a **Personal Decision Layer** operating on top of verified emergency broadcasts.

---

## 2. Core Value Proposition
1. **Personal Risk Quantification**: Computes a transparent prototype score:
   $$\text{Risk} = \text{Severity} \times \text{Exposure} \times \text{Vulnerability} \times \text{Time Pressure}$$
2. **Mobility-Aware Safe Routing**: Uses graph pathfinding that strictly rejects physical barriers (stairs, unpaved terrain, flooded roads) for vulnerable individuals.
3. **Structured Directive Extraction**: Generates unambiguous `NOW`, `NEXT`, `AVOID`, and `IF → THEN` action rules.
4. **Multilingual Crisis Communication**: Delivers localized directives in English, Hindi, Bengali, Odia, Urdu, and Japanese, with an English fallback when a string is unavailable.
5. **Offline Guarantee**: Persists the last verified action plan locally in case connectivity collapses during severe weather.

---

## 3. Product Positioning & Safety Boundaries
- **No Hallucinated Facts**: Shelter capacities, road statuses, and flood levels come strictly from deterministic verified engines.
- **Fail-Safe Mechanism**: When telemetry is missing or unverified, the system displays `⚠️ INSUFFICIENT INFORMATION` and guides vertical in-place sheltering.
- **Source Provenance**: 4-Tier trust hierarchy where official authorities (NDMA, FEMA) override unverified crowd signals.
- **Location and Situation Setup**: Users can use saved profile coordinates or browser geolocation, select a backend-supported situation, and send both through the existing decision pipeline.
- **Coverage Boundary**: The seeded route graph covers the seeded demo origin. Outside that network, route guidance is unavailable rather than fabricated.