"""Training-load models for the LoadPace analytics engine.

Two models are implemented, matching the disciplines handled by the platform:

* **TRIMP** (Banister) for endurance sessions with heart-rate data:
  ``TRIMP = duration * HRr * 0.64 * e^(1.92 * HRr)`` where
  ``HRr = (avgHR - restHR) / (maxHR - restHR)`` is the fraction of
  heart-rate reserve.
* **session-RPE** (Foster) otherwise: ``load = RPE * duration``.

References:
    Banister E.W., Calvert T.W., Planning for future performance:
        implications for long term training, Can. J. Appl. Sport Sci., 1980.
    Foster C. et al., A new approach to monitoring exercise training,
        J. Strength Cond. Res., 2001.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

# Exponential weighting factor of the Banister TRIMP model (generic/men coefficient).
TRIMP_WEIGHT = 1.92


@dataclass(frozen=True)
class LoadResult:
    load_au: float
    method: str


def calculate_load(
    sport_type: str,
    duration_min: Optional[int],
    rpe: Optional[int] = None,
    avg_hr: Optional[int] = None,
    resting_hr: Optional[int] = None,
    max_hr: Optional[int] = None,
) -> LoadResult:
    """Estimate the training load (arbitrary units) of a single session.

    Raises:
        ValueError: if the duration is not positive, or if neither a usable
            heart-rate profile nor an RPE value is provided.
    """
    if duration_min is None or duration_min <= 0:
        raise ValueError("Duration must be a positive number of minutes")

    if sport_type != "STRENGTH" and _can_use_trimp(avg_hr, resting_hr, max_hr):
        hr_reserve = (avg_hr - resting_hr) / (max_hr - resting_hr)
        hr_reserve = _clamp(hr_reserve, 0.0, 1.0)
        load = duration_min * hr_reserve * 0.64 * math.exp(TRIMP_WEIGHT * hr_reserve)
        return LoadResult(round(load, 1), "TRIMP")

    if rpe is not None and rpe > 0:
        return LoadResult(round(float(rpe) * duration_min, 1), "S-RPE")

    raise ValueError(
        "Provide RPE, or heart-rate data together with a profile "
        "(resting and max HR), to estimate load"
    )


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
