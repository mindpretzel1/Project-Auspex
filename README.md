# Project Auspex

Project Auspex is an explainable cybersecurity domain intelligence MVP. It accepts a domain name and returns a model-derived risk score, predicted class, confidence breakdown, lexical explanation, and domain feature details.

Auspex is designed as a hackathon-ready domain-risk triage tool, not a production threat intelligence system.

## Model Summary

The deployed model is the saved scikit-learn pipeline in `models/auspex_model.pkl`.

- Model: Combined Character N-Grams + Lexical Features + SGDClassifier
- Pipeline: `ColumnTransformer` with character `HashingVectorizer`, numeric lexical features, TLD `OneHotEncoder`, and `SGDClassifier(loss="log_loss")`
- Input schema: V1 feature schema from `data/processed/auspex_features_v1.csv`
- Source notebook: `notebooks/07_combined_feature_model.ipynb`

The app does not retrain the model.

## Metrics

From `models/auspex_model_metrics.json`:

- Accuracy: 0.966
- Macro F1: 0.454
- Weighted F1: 0.962
- Malicious recall: 0.382
- Malicious precision: 0.632
- Malicious F1: 0.477

The dataset is highly imbalanced, so accuracy alone is not enough to judge operational usefulness.

## Backend

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run the FastAPI server from the repo root:

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

Available endpoints:

- `GET /health`
- `POST /analyze`

Example request:

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"paypal-secure-login-update.com\"}"
```

Optional environment variables:

- `AUSPEX_MODEL_PATH`: path to the saved model artifact, defaults to `models/auspex_model.pkl`
- `AUSPEX_CORS_ORIGINS`: comma-separated allowed frontend origins, defaults to `*`

## Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run the Next.js app:

```bash
npm run dev
```

Open `http://localhost:3000`.

The frontend calls:

```text
POST ${NEXT_PUBLIC_API_URL}/analyze
```

For local development, copy `frontend/.env.example` to `frontend/.env.local` or set:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Demo Domains

- `google.com`
- `paypal-secure-login-update.com`
- `xk29qz7vbn-login-update.ru`

## Deployment

Backend options include Render, Railway, Fly.io, or another Python web host.

Suggested backend start command:

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

Frontend can be deployed on Vercel. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.

## Limitations

- MVP uses lexical domain features and character-level patterns only.
- It does not use WHOIS, DNS, VirusTotal, passive DNS, or certificate transparency.
- Dataset classes are highly imbalanced.
- Risk score is model-derived and should not be treated as ground truth.
- Results should be reviewed before operational use.

## Future Work

- WHOIS and domain age enrichment
- DNS reputation signals
- Certificate transparency features
- Passive DNS enrichment
- Better probability calibration
- More robust minority-class training
