"""
Tests for Risk Engine Prototype Calculations
"""
import pytest
from app.schemas.alert import Alert, AlertSeverity, AlertCertainty, HazardType, SourceLevel, SourceProvenance
from app.schemas.user import UserProfile, MobilityType, TransportType, CompanionType, LanguageType
from app.schemas.risk import RiskLevel
from app.engines.risk_engine import RiskEngine


@pytest.fixture
def base_alert():
    return Alert(
        id="ALERT-TEST",
        hazard_type=HazardType.FLOOD,
        severity=AlertSeverity.HIGH,
        certainty=AlertCertainty.LIKELY,
        headline="High Flash Flood Warning",
        description="Testing",
        lat=28.6139,
        lng=77.2090,
        radius_km=5.0,
        time_to_impact_minutes=32,
        required_action="evacuate",
        source_level=SourceLevel.LEVEL_1_OFFICIAL,
        provenance=SourceProvenance(
            source_name="Official Bureau",
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            timestamp="2026-09-02T10:00:00Z",
            confidence=0.98,
            verified=True
        ),
        created_at="2026-09-02T10:00:00Z",
        active=True
    )


def test_high_risk_user_calculation(base_alert):
    vulnerable_user = UserProfile(
        id="user-vuln",
        name="Vulnerable User",
        lat=28.6139,
        lng=77.2090,
        language=LanguageType.EN,
        mobility=MobilityType.LIMITED,
        transport=TransportType.WALKING,
        companions=CompanionType.NONE
    )
    risk = RiskEngine.calculate_risk(base_alert, vulnerable_user)
    assert risk.score >= 75
    assert risk.level in [RiskLevel.HIGH, RiskLevel.EXTREME]
    assert len(risk.reasons) >= 3
    assert len(risk.breakdown) == 4
    assert risk.estimated_action_window_minutes == 32


def test_normal_mobility_user_lower_risk(base_alert):
    normal_user = UserProfile(
        id="user-normal",
        name="Normal User",
        lat=28.6139,
        lng=77.2090,
        language=LanguageType.EN,
        mobility=MobilityType.NORMAL,
        transport=TransportType.CAR,
        companions=CompanionType.NONE
    )
    risk_normal = RiskEngine.calculate_risk(base_alert, normal_user)
    vulnerable_user = UserProfile(
        id="user-vuln",
        name="Wheelchair User",
        lat=28.6139,
        lng=77.2090,
        language=LanguageType.EN,
        mobility=MobilityType.WHEELCHAIR,
        transport=TransportType.WALKING,
        companions=CompanionType.ELDERLY
    )
    risk_vuln = RiskEngine.calculate_risk(base_alert, vulnerable_user)
    assert risk_normal.score < risk_vuln.score
