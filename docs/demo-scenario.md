# Demo walkthrough

The ACT demo follows the real backend simulation flow.

1. Open the dashboard and review the verified emergency alert.
2. Confirm the user profile and the personal risk score.
3. Review the recommended shelter and evacuation route.
4. Trigger the roadblock simulation from the scenario controls.
5. Observe the backend route recalculation and the updated action plan.
6. Watch the map update to the recalculated route and destination.
7. Switch language or mobility profile to confirm the ACT logic still updates without breaking the flow.

## Example sequence

- Initial shelter: Shelter B
- Initial route: Highland Boulevard route to Shelter B
- Trigger: roadblock on the active corridor
- Recalculated outcome: backend route updates to the next viable shelter and path
- UI response: map, action plan, and state refresh from the backend response

This is a visual demonstration of the real ACT system, not a separate frontend-only route engine.