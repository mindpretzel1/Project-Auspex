# Project Auspex

Auspex is an explainable domain intelligence tool that uses machine learning to assess the risk of a domain name using only lexical characteristics of the domain itself.

Given a domain, Auspex predicts whether it appears:

- Benign
- Malware
- Phishing
- Spam

The application also provides:

- Risk score
- Confidence breakdown
- Domain feature analysis
- Human-readable explanations

The model was trained on over one million labeled domains derived from the CIC Bell DNS 2021 dataset.

## Live Demo

Frontend:

```text
https://project-auspex.vercel.app/
```

Note: First request may take a moment due to hosting service startup.

## How To Use

1. Open the web application.
2. Enter a domain name.
3. Click **Analyze Domain**.
4. Review the prediction, risk score, confidence breakdown, and explanation.

Example domains:

```text
google.com
paypal-secure-login-update.com
xk29qz7vbn-login-update.ru
```

## Technology Stack

- Python
- Scikit-learn
- FastAPI
- Next.js
- TypeScript
- Tailwind CSS
- Render
- Vercel

## Model

The deployed model combines:

- Lexical domain features
- Character-level n-grams
- SGDClassifier

Performance on the evaluation dataset:

```text
Accuracy: 96.6%
Macro F1: 0.45
Malicious Precision: 0.63
Malicious Recall: 0.38
```

## Limitations

Auspex is an MVP and proof of concept.

The current version only analyzes the domain string itself and does not use:

- DNS records
- WHOIS data
- Domain age
- Certificate information
- Reputation services

Results should be used as a risk indicator rather than a definitive security verdict.

## Dataset Attribution

Canadian Institute for Cybersecurity (CIC)

CIC Bell DNS 2021 Dataset

https://www.unb.ca/cic/datasets/
