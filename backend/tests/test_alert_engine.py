"""
Tests for Alert Engine and Provenance Verification
"""
import pytest
from app.schemas.alert import Alert, AlertSeverity, AlertCertainty, HazardType, SourceLevel, SourceProvenance
from app.engines.alert_engine import AlertEngine


def test_valid_flood_alert():
    alert = Alert(
        id="TEST-01",
        hazard_type=HazardType.FLOOD,
        severity=AlertSeverity.HIGH,
        certainty=AlertCertainty.LIKELY,
        headline="Test Flood Warning",
        description="Test description",
        lat=28.6139,
        lng=77.2090,
        radius_km=5.0,
        time_to_impact_minutes=30,
        required_action="evacuate",
        source_level=SourceLevel.LEVEL_1_OFFICIAL,
        provenance=SourceProvenance(
            source_name="National Emergency Agency",
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            timestamp="2026-09-02T10:00:00Z",
            confidence=0.98,
            verified=True
        ),
        created_at="2026-09-02T10:00:00Z",
        active=True
    )
    is_valid, err = AlertEngine.validate_alert(alert)
    assert is_valid is True
    assert err is None


def test_invalid_alert_missing_headline():
    alert = Alert(
        id="TEST-02",
        hazard_type=HazardType.FLOOD,
        severity=AlertSeverity.HIGH,
        certainty=AlertCertainty.LIKELY,
        headline="",
        description="Test",
        lat=28.6139,
        lng=77.2090,
        radius_km=5.0,
        time_to_impact_minutes=30,
        required_action="evacuate",
        source_level=SourceLevel.LEVEL_1_OFFICIAL,
        provenance=SourceProvenance(
            source_name="Agency",
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            timestamp="2026-09-02T10:00:00Z",
            confidence=0.9,
            verified=True
        ),
        created_at="2026-09-02T10:00:00Z",
        active=True
    )
    is_valid, err = AlertEngine.validate_alert(alert)
    assert is_valid is False
    assert "headline is missing" in err


def test_user_exposure_calculation():
    alert = Alert(
        id="TEST-03",
        hazard_type=HazardType.FLOOD,
        severity=AlertSeverity.HIGH,
        certainty=AlertCertainty.LIKELY,
        headline="Yamuna Flood",
        description="Test",
        lat=28.6139,
        lng=77.2090,
        radius_km=5.0,
        time_to_impact_minutes=30,
        required_action="evacuate",
        source_level=SourceLevel.LEVEL_1_OFFICIAL,
        provenance=SourceProvenance(
            source_name="Agency",
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            timestamp="2026-09-02T10:00:00Z",
            confidence=0.9,
            verified=True
        ),
        created_at="2026-09-02T10:00:00Z",
        active=True
    )
    # Exact center
    exposure, inside = AlertEngine.evaluate_user_exposure(alert, 28.6139, 77.2090)
    assert exposure == 1.0
    assert inside is True

    # 100km away
    exposure_far, inside_far = AlertEngine.evaluate_user_exposure(alert, 29.5000, 78.5000)
    assert exposure_far < 0.5
    assert inside_far is False
