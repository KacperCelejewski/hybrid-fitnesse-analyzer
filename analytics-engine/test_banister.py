import pytest

from banister import FitnessPoint, project


def test_two_days_hand_computed():
    # Day 1: ctl = 100/42 = 2.381, atl = 100/7 = 14.286, tsb = -11.905
    # Day 2 (w=0): ctl = 2.381 * 41/42 = 2.324, atl = 14.286 * 6/7 = 12.245
    result = project([100, 0])
    assert result == [
        FitnessPoint(ctl=2.4, atl=14.3, tsb=-11.9),
        FitnessPoint(ctl=2.3, atl=12.2, tsb=-9.9),
    ]


def test_empty_input_gives_empty_list():
    assert project([]) == []


def test_constant_load_converges_to_load():
    result = project([100.0] * 400)
    assert result[-1].ctl == pytest.approx(100.0, abs=0.1)
    assert result[-1].atl == pytest.approx(100.0, abs=0.1)
    assert result[-1].tsb == pytest.approx(0.0, abs=0.1)


def test_initial_state_is_used():
    # w = ctl0 = atl0 keeps the state unchanged
    result = project([50.0], ctl0=50.0, atl0=50.0)
    assert result == [FitnessPoint(ctl=50.0, atl=50.0, tsb=0.0)]


def test_tsb_negative_after_load_spike():
    result = project([0, 0, 300])
    assert result[-1].tsb < 0


def test_rounding_does_not_accumulate_error():
    unrounded = project([100.0] * 100, tau_fit=42, tau_fat=7)
    ctl = atl = 0.0
    for _ in range(100):
        ctl += (100.0 - ctl) / 42
        atl += (100.0 - atl) / 7
    assert unrounded[-1].ctl == round(ctl, 1)
    assert unrounded[-1].atl == round(atl, 1)


def test_result_is_frozen():
    point = project([10])[0]
    with pytest.raises(Exception):
        point.ctl = 1.0


@pytest.mark.parametrize("kwargs", [
    {"tau_fit": 0},
    {"tau_fat": 0},
    {"tau_fit": -5},
    {"ctl0": -1.0},
    {"atl0": -1.0},
])
def test_invalid_parameters_raise(kwargs):
    with pytest.raises(ValueError):
        project([10], **kwargs)


def test_negative_load_raises():
    with pytest.raises(ValueError):
        project([10, -1])
