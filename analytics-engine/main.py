from fastapi import FastAPI

app = FastAPI(title="MultiLoad Analytics Engine")


@app.get("/")
def home():
    return {"status": "online", "version": "1.0.0"}


@app.get("/estimate")
def estimate_load(duration_min: int, avg_hr: int):
    # Sample load estimation formula
    load = duration_min * (avg_hr / 100)
    return {
        "calculated_load": load,
        "advice": "Keep it up!" if load < 100 else "Consider recovery.",
    }
