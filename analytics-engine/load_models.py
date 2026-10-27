"""Training-load models for the LoadPace analytics engine.

Every session, strength or endurance, is expressed on one common scale so that
loads can be summed and fed to the fitness-fatigue projection:

* **session-RPE** is always computed: ``load = RPE * duration`` (minutes).
* **TRIMP** is computed additionally for endurance sessions with heart-rate
  data and a profile (resting and max HR). It is an auxiliary indicator and is
  never mixed into the common load:
  ``TRIMP = duration * HRr * 0.64 * e^(1.92 * HRr)`` where
  ``HRr = (avgHR - restHR) / (maxHR - restHR)`` is the fraction of
  heart-rate reserve.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

# Exponential weighting factor of the TRIMP model (generic/men coefficient).
TRIMP_WEIGHT = 1.92


@dataclass(frozen=True)
class LoadResult:
    load_au: float
    trimp: Optional[float]


def calculate_load(
    sport_type: str,
    duration_min: Optional[int],
    rpe: Optional[int] = None,
    avg_hr: Optional[int] = None,
    resting_hr: Optional[int] = None,
    max_hr: Optional[int] = None,
) -> LoadResult:
    """Estimate the training load (arbitrary units) of a single session.

    ``load_au`` is always the session-RPE load. ``trimp`` is set only for
    non-strength sessions with usable heart-rate data, otherwise ``None``.

    Raises:
        ValueError: if the duration or the RPE is missing or not positive.
    """
    if duration_min is None or duration_min <= 0:
        raise ValueError("Duration must be a positive number of minutes")
    if rpe is None or rpe <= 0:
        raise ValueError("RPE is required to estimate the load of a session")

    load_au = round(float(rpe) * duration_min, 1)

    trimp = None
    if sport_type != "STRENGTH" and _can_use_trimp(avg_hr, resting_hr, max_hr):
        hr_reserve = (avg_hr - resting_hr) / (max_hr - resting_hr)
        hr_reserve = _clamp(hr_reserve, 0.0, 1.0)
        trimp = round(duration_min * hr_reserve * 0.64 * math.exp(TRIMP_WEIGHT * hr_reserve), 1)

    return LoadResult(load_au, trimp)


def _can_use_trimp(
    avg_hr: Optional[int], resting_hr: Optional[int], max_hr: Optional[int]
) -> bool:
    return (
        avg_hr is not None
        and avg_hr > 0
        and resting_hr is not None
        and max_hr is not None
        and max_hr > resting_hr
    )


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))
