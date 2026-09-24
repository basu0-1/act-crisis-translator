# Demo walkthrough

The ACT demo follows the real backend simulation flow.

1. Open the dashboard and review the `Your situation` setup area.
2. Use the saved demo location or request browser location.
3. Select Flood and press `Check my safety`.
4. Review the verified alert, personal risk, action plan, recommended shelter, and route.
5. Trigger the roadblock simulation from the scenario controls.
6. Observe the backend route recalculation and the updated action plan.
7. Watch the map update to the recalculated route and destination.
8. Switch language or mobility profile to confirm the ACT logic still updates without breaking the flow.

## Example sequence

- Initial shelter: Shelter B
- Initial route: Highland Boulevard route to Shelter B
- Trigger: roadblock on the active corridor
- Recalculated outcome: backend route updates to the next viable shelter and path
- UI response: map, action plan, and state refresh from the backend response

This is a visual demonstration of the real ACT system, not a separate frontend-only route engine.

The other situation choices are supported by the backend hazard schema, but the current repository contains no verified alert feed for them. ACT therefore marks them unverified and shows the fail-safe guidance instead of presenting a fabricated route or official alert.