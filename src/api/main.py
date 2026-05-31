"""FastAPI API for Project Auspex domain analysis."""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.predictor import ModelLoadError, analyze_domain, is_model_loaded


class AnalyzeRequest(BaseModel):
    domain: str = Field(..., min_length=1, max_length=253)


app = FastAPI(
    title="Project Auspex API",
    description="Explainable domain-risk triage API backed by the saved Auspex model.",
    version="0.1.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("AUSPEX_CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "model_loaded": is_model_loaded()}


@app.post("/analyze")
def analyze(request: AnalyzeRequest) -> dict[str, Any]:
    try:
        return analyze_domain(request.domain)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ModelLoadError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
