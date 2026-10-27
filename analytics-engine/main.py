from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from load_models import calculate_load

app = FastAPI(title="LoadPace Analytics Engine", version="3.0.0")


class LoadRequest(BaseModel):
    type: Literal["RUN", "CYCLE", "STRENGTH"]
    durationMin: int = Field(gt=0, le=1440)
    rpe: int = Field(ge=1, le=10)
    avgHr: Optional[int] = Field(default=None, ge=1, le=250)
    restingHr: Optional[int] = Field(default=None, ge=30, le=120)
    maxHr: Optional[int] = Field(default=None, ge=120, le=230)


class LoadResponse(BaseModel):
    loadAu: float
    trimp: Optional[float] = None


@app.get("/health")
def health():
    return {"status": "online", "version": "3.0.0"}


@app.post("/calculate", response_model=LoadResponse)
def calculate(request: LoadRequest):
    """Estimate the session-RPE load of a session, plus TRIMP when heart-rate data allows."""
    try:
        result = calculate_load(
            request.type,
            request.durationMin,
            request.rpe,
            request.avgHr,
            request.restingHr,
            request.maxHr,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return LoadResponse(loadAu=result.load_au, trimp=result.trimp)
