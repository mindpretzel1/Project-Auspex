"""Prediction orchestration for Project Auspex."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from src.explain import generate_explanation
from src.features import FEATURE_COLUMNS, extract_features


class ModelLoadError(RuntimeError):
    """Raised when the saved model cannot be loaded."""


def _project_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _resolve_model_path() -> Path:
    configured_path = Path(os.getenv("AUSPEX_MODEL_PATH", "models/auspex_model.pkl"))
    candidates = [
        configured_path,
        Path.cwd() / configured_path,
        _project_root() / configured_path,
    ]

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()

    searched = ", ".join(str(candidate) for candidate in candidates)
    raise ModelLoadError(f"Could not find model artifact. Searched: {searched}")


@lru_cache(maxsize=1)
def load_model() -> Any:
    try:
        return joblib.load(_resolve_model_path())
    except ModelLoadError:
        raise
    except Exception as exc:  # pragma: no cover - depends on local model artifact
        raise ModelLoadError(f"Could not load model artifact: {exc}") from exc


def is_model_loaded() -> bool:
    try:
        load_model()
    except ModelLoadError:
        return False
    return True


def _risk_band(risk_score: int) -> str:
    if risk_score <= 30:
        return "Low"
    if risk_score <= 70:
        return "Medium"
    return "High"


def _response_features(features: dict[str, str | int | float]) -> dict[str, str | int | float]:
    return {
        "length": int(features["length"]),
        "digit_count": int(features["digit_count"]),
        "digit_ratio": round(float(features["digit_ratio"]), 4),
        "dot_count": int(features["dot_count"]),
        "tld": str(features["tld"]),
        "starts_with_digit": int(features["starts_with_digit"]),
        "contains_www": int(features["contains_www"]),
        "entropy": round(float(features["entropy"]), 4),
        "hyphen_count": int(features["hyphen_count"]),
    }


def analyze_domain(domain: str) -> dict[str, Any]:
    model = load_model()
    features = extract_features(domain)
    model_input = pd.DataFrame([{column: features[column] for column in FEATURE_COLUMNS}])

    prediction = str(model.predict(model_input)[0])
    probability_values = model.predict_proba(model_input)[0]
    class_labels = [str(label) for label in getattr(model, "classes_", [])]
    raw_probabilities = {
        label: float(probability) for label, probability in zip(class_labels, probability_values)
    }
    probabilities = {
        label: round(probability, 4) for label, probability in raw_probabilities.items()
    }

    benign_probability = raw_probabilities.get("benign", 0.0)
    risk_score = max(0, min(100, round(100 * (1 - benign_probability))))

    return {
        "domain": str(features["domain"]),
        "prediction": prediction,
        "risk_score": risk_score,
        "risk_band": _risk_band(risk_score),
        "probabilities": probabilities,
        "explanation": generate_explanation(str(features["domain"]), features, probabilities),
        "features": _response_features(features),
    }
