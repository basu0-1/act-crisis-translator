"""
Tests for 5-Agent AI Pipeline, Fail-Safe Behavior, and Multilingual Communication
"""
import pytest
from app.schemas.alert import Alert, AlertSeverity, AlertCertainty, HazardType, SourceLevel, SourceProvenance
from app.schemas.user import UserProfile, MobilityType, LanguageType
from app.agents.alert_analyst import AlertAnalystAgent
from app.agents.risk_analyst import RiskAnalystAgent
from app.agents.route_analyst import RouteAnalystAgent
from app.agents.action_planner import ActionPlannerAgent
from app.agents.communication_agent import CommunicationAgent
from app.engines.decision_engine import DecisionEngine
from app.data.mock_database import DEFAULT_ALERT, DEFAULT_USER, DEFAULT_ROADS, DEFAULT_SHELTERS


def test_agent_1_alert_analyst():
    analysis = AlertAnalystAgent.analyze(DEFAULT_ALERT)
    assert analysis["hazard"] == "flood"
    assert analysis["severity"] == "high"
    assert analysis["time_to_impact_minutes"] == 32
    assert "Level 1" in analysis["source_level"]


def test_agent_4_action_planner_generates_verified_plan():
    risk = RiskAnalystAgent.analyze(DEFAULT_ALERT, DEFAULT_USER)
    route_rec = RouteAnalystAgent.analyze(DEFAULT_ROADS, DEFAULT_SHELTERS, DEFAULT_USER)
    facts = DecisionEngine.build_verified_facts(DEFAULT_ALERT, DEFAULT_USER, risk, route_rec)
    
    plan = ActionPlannerAgent.generate_plan(facts, DEFAULT_ALERT.provenance, LanguageType.EN)
    assert len(plan.now) >= 2
    assert len(plan.next) >= 1
    assert len(plan.avoid) >= 2
    assert len(plan.if_then) >= 1
    assert "Riverside Road" in str(plan.avoid)
    assert plan.failsafe_status is None


def test_agent_5_communication_multilingual():
    risk = RiskAnalystAgent.analyze(DEFAULT_ALERT, DEFAULT_USER)
    route_rec = RouteAnalystAgent.analyze(DEFAULT_ROADS, DEFAULT_SHELTERS, DEFAULT_USER)
    facts = DecisionEngine.build_verified_facts(DEFAULT_ALERT, DEFAULT_USER, risk, route_rec)
    base_plan = ActionPlannerAgent.generate_plan(facts, DEFAULT_ALERT.provenance, LanguageType.EN)

    # English
    plan_en = CommunicationAgent.format_and_localize(base_plan, LanguageType.EN)
    assert plan_en.language == LanguageType.EN

    # Hindi
    plan_hi = CommunicationAgent.format_and_localize(base_plan, LanguageType.HI)
    assert plan_hi.language == LanguageType.HI
    assert "तुरंत" in plan_hi.now[0] or "सुरक्षित" in str(plan_hi.now)

    # Japanese
    plan_ja = CommunicationAgent.format_and_localize(base_plan, LanguageType.JA)
    assert plan_ja.language == LanguageType.JA
    assert "直ちに" in plan_ja.now[0] or "避難" in str(plan_ja.now)


def test_failsafe_behavior_on_missing_route():
    facts = {
        "hazard_type": "flood",
        "severity": "extreme",
        "risk_score": 95,
        "failsafe_status": "⚠️ INSUFFICIENT INFORMATION",
        "failsafe_reason": "No accessible path available due to severe flooding."
    }
    failsafe_plan = ActionPlannerAgent.generate_plan(facts, DEFAULT_ALERT.provenance, LanguageType.EN)
    assert failsafe_plan.failsafe_status == "⚠️ INSUFFICIENT INFORMATION"
    assert "Shelter-in-Place" in failsafe_plan.destination_shelter
