import math

import pytest
from fastapi.testclient import TestClient

from load_models import calculate_load
from main import app

client = TestClient(app)


# --- Unit tests for the models ------------------------------------------------

def test_strength_has_no_trimp():
    # S-RPE: load = RPE * duration = 7 * 60 = 420; TRIMP is never computed for strength
    result = calculate_load("STRENGTH", 60, rpe=7, avg_hr=150, resting_hr=60, max_hr=190)
    assert result.load_au == 420.0
    assert result.trimp is None


def test_endurance_with_heart_rate_returns_srpe_and_trimp():
    # HRr = (150 - 60) / (190 - 60) = 0.6923
    # TRIMP = 60 * 0.6923 * 0.64 * e^(1.92 * 0.6923) ~= 100.4
    result = calculate_load("RUN", 60, rpe=5, avg_hr=150, resting_hr=60, max_hr=190)
    assert result.load_au == 300.0
    assert math.isclose(result.trimp, 100.4, abs_tol=0.5)


def test_endurance_without_profile_has_no_trimp():
    result = calculate_load("RUN", 45, rpe=6, avg_hr=150)
    assert result.load_au == 270.0
    assert result.trimp is None


def test_trimp_is_clamped_when_hr_above_max():
    # HRr above 1 is clamped to 1.0: TRIMP = 60 * 1.0 * 0.64 * e^1.92
    result = calculate_load("RUN", 60, rpe=5, avg_hr=200, resting_hr=60, max_hr=190)
    assert result.trimp == round(60 * 0.64 * math.exp(1.92), 1)


def test_missing_rpe_raises():
    with pytest.raises(ValueError):
        calculate_load("RUN", 45, avg_hr=150, resting_hr=60, max_hr=190)


def test_non_positive_rpe_raises():
    with pytest.raises(ValueError):
        calculate_load("RUN", 45, rpe=0)


def test_non_positive_duration_raises():
    with pytest.raises(ValueError):
        calculate_load("STRENGTH", 0, rpe=7)


# --- API tests ----------------------------------------------------------------

def test_calculate_endpoint_strength():
    response = client.post("/calculate", json={"type": "STRENGTH", "durationMin": 60, "rpe": 7})
    assert response.status_code == 200
    assert response.json() == {"loadAu": 420.0, "trimp": None}


def test_calculate_endpoint_run_with_hr():
    response = client.post(
        "/calculate",
        json={"type": "RUN", "durationMin": 60, "rpe": 5, "avgHr": 150, "restingHr": 60, "maxHr": 190},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["loadAu"] == 300.0
    assert body["trimp"] is not None


def test_calculate_endpoint_requires_rpe():
    response = client.post("/calculate", json={"type": "RUN", "durationMin": 40})
    assert response.status_code == 422


@pytest.mark.parametrize("rpe", [0, 11])
def test_calculate_endpoint_rejects_rpe_out_of_range(rpe):
    response = client.post("/calculate", json={"type": "RUN", "durationMin": 40, "rpe": rpe})
    assert response.status_code == 422


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
