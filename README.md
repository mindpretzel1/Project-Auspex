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
- `AUSPEX_CORS_ORIGINS`: comma-separated allowed frontend origins. Use `*` locally only; set the exact Vercel URL in production.

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

This repository is configured for:

- Backend: Render web service using `render.yaml`
- Frontend: Vercel Next.js project using `frontend/vercel.json`

Before deploying, make sure these files are committed:

- `models/auspex_model.pkl`
- `models/auspex_model_metrics.json`
- `requirements.txt`
- `.python-version`
- `render.yaml`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vercel.json`

The model artifact is required on Render. The `.gitignore` file intentionally allows `models/auspex_model.pkl` to be tracked.

### Deploy Backend To Render

1. Push the repo to GitHub.
2. In Render, create a new Blueprint or Web Service from the GitHub repo.
3. Use the included `render.yaml`, or configure the service manually:

```text
Runtime: Python
Build Command: python -m pip install --upgrade pip && python -m pip install -r requirements.txt
Start Command: uvicorn src.api.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

4. Set environment variables:

```text
PYTHON_VERSION=3.14.3
AUSPEX_MODEL_PATH=models/auspex_model.pkl
AUSPEX_CORS_ORIGINS=https://<frontend>.vercel.app
```

5. Deploy and verify:

```bash
curl https://<backend>.onrender.com/health
curl -X POST https://<backend>.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"google.com\"}"
```

Expected health response:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

### Deploy Frontend To Vercel

1. In Vercel, import the GitHub repo.
2. Set the project root directory to:

```text
frontend
```

3. Confirm settings:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

4. Set the Production environment variable:

```text
NEXT_PUBLIC_API_URL=https://<backend>.onrender.com
```

5. Deploy the Vercel project.

If you deploy the frontend first, update Render's `AUSPEX_CORS_ORIGINS` after the Vercel URL is known and redeploy the backend. If you deploy the backend first, update Vercel's `NEXT_PUBLIC_API_URL` after the Render URL is known and redeploy the frontend.

### Production Verification Checklist

- `https://<backend>.onrender.com/health` returns `{"status":"ok","model_loaded":true}`.
- `POST https://<backend>.onrender.com/analyze` returns a prediction payload.
- Vercel has `NEXT_PUBLIC_API_URL=https://<backend>.onrender.com`.
- Render has `AUSPEX_CORS_ORIGINS=https://<frontend>.vercel.app`.
- Opening `https://<frontend>.vercel.app` on a laptop loads the app.
- Opening `https://<frontend>.vercel.app` on a phone loads the app.
- Submitting `google.com` returns a low-risk result.
- Submitting `paypal-secure-login-update.com` returns a risk score, class confidence bars, and explanation.

For local backend testing, the equivalent start command remains:

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

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
