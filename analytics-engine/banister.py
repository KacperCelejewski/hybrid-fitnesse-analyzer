"""Fitness-fatigue projection for the LoadPace analytics engine.

Implements the impulse-response (fitness-fatigue) model of Banister as the
discrete exponentially weighted recursion used in performance-management
charts. For a daily training load ``w``:

* **CTL** (chronic training load, "fitness"):
  ``CTL += (w - CTL) / tau_fit``  (default ``tau_fit = 42`` days)
* **ATL** (acute training load, "fatigue"):
  ``ATL += (w - ATL) / tau_fat``  (default ``tau_fat = 7`` days)
* **TSB** (training stress balance, "form"): ``TSB = CTL - ATL``

The ``x += (w - x) / tau`` update is the first-order approximation of the
exponential decay ``e^(-1/tau)`` of the original model.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FitnessPoint:
    ctl: float
    atl: float
    tsb: float


def project(
    daily_loads: list[float],
    tau_fit: float = 42,
    tau_fat: float = 7,
    ctl0: float = 0.0,
    atl0: float = 0.0,
) -> list[FitnessPoint]:
    """Project CTL, ATL and TSB day by day from a series of daily loads.

    ``ctl0`` and ``atl0`` are the state before the first day. Each returned
    point holds the values after that day's load, rounded to one decimal; the
    internal state keeps full precision.

    Raises:
        ValueError: if a time constant is not positive, or if an initial
            value or a daily load is negative.
    """
    if tau_fit <= 0 or tau_fat <= 0:
        raise ValueError("Time constants must be positive")
    if ctl0 < 0 or atl0 < 0:
        raise ValueError("Initial CTL and ATL must not be negative")
    if any(load < 0 for load in daily_loads):
        raise ValueError("Daily loads must not be negative")

    ctl, atl = float(ctl0), float(atl0)
    points: list[FitnessPoint] = []
    for load in daily_loads:
        ctl += (load - ctl) / tau_fit
        atl += (load - atl) / tau_fat
        points.append(FitnessPoint(round(ctl, 1), round(atl, 1), round(ctl - atl, 1)))
    return points
