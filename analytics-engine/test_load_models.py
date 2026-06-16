import math

import pytest
from fastapi.testclient import TestClient

from load_models import calculate_load
from main import app

client = TestClient(app)


# --- Unit tests for the models ------------------------------------------------

def test_strength_uses_session_rpe():
    # S-RPE (Foster): load = RPE * duration = 7 * 60 = 420
    result = calculate_load("STRENGTH", 60, rpe=7)
    assert result.method == "S-RPE"
    assert result.load_au == 420.0


def test_endurance_with_heart_rate_uses_trimp():
    # HRr = (150 - 60) / (190 - 60) = 0.6923
    # TRIMP = 60 * 0.6923 * 0.64 * e^(1.92 * 0.6923) ~= 100.4
    result = calculate_load("RUN", 60, rpe=5, avg_hr=150, resting_hr=60, max_hr=190)
    assert result.method == "TRIMP"
    assert math.isclose(result.load_au, 100.4, abs_tol=0.5)


def test_endurance_without_profile_falls_back_to_session_rpe():
    result = calculate_load("RUN", 45, rpe=6, avg_hr=150)
    assert result.method == "S-RPE"
    assert result.load_au == 270.0


def test_missing_rpe_and_heart_rate_raises():
    with pytest.raises(ValueError):
        calculate_load("RUN", 45)


def test_non_positive_duration_raises():
    with pytest.raises(ValueError):
        calculate_load("STRENGTH", 0, rpe=7)


# --- API tests ----------------------------------------------------------------

def test_calculate_endpoint_strength():
    response = client.post("/calculate", json={"type": "STRENGTH", "durationMin": 60, "rpe": 7})
    assert response.status_code == 200
    body = response.json()
    assert body == {"loadAu": 420.0, "method": "S-RPE"}


def test_calculate_endpoint_trimp():
    response = client.post(
        "/calculate",
        json={"type": "RUN", "durationMin": 60, "rpe": 5, "avgHr": 150, "restingHr": 60, "maxHr": 190},
    )
    assert response.status_code == 200
    assert response.json()["method"] == "TRIMP"


def test_calculate_endpoint_unprocessable_when_no_inputs():
    response = client.post("/calculate", json={"type": "RUN", "durationMin": 40})
    assert response.status_code == 422


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
