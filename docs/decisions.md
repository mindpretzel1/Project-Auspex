# Decisions

## Dataset

Using CIC-Bell-DNS2021.

## MVP

Input:
- Domain

Output:
- Risk Score
- Classification
- Explanation

## Feature Strategy

Instead of relying on all dataset features, generate our own lexical features from domains.

Initial features:
- Length
- Digit count
- Digit ratio
- Hyphen count
- Entropy
- TLD
- Subdomain count

## First Model

Random Forest baseline.

## Dataset Decision

Use raw domain lists from CIC-Bell-DNS2021 as the primary training source.

Reason:
- Clean labels
- Directly matches product input
- Avoids dependence on opaque engineered features
- Easier to explain and reproduce

## Dataset Selection

Decision:
Use raw CIC-Bell-DNS2021 domain lists.

Reason:
Processed DNS feature datasets contained parsing issues and opaque engineered features.

Raw domains better match the intended product input.

---

## Unified Dataset

Created:
auspex_domains_v1.csv

Schema:

domain,label

Labels:
- benign
- phishing
- malware
- spam

---

## Label Conflicts

467 domains appeared under multiple labels.

Decision:
Remove conflicting domains from training data.

Reason:
Reduce label ambiguity and training noise.

# Decisions Log

## Dataset Selection

Selected the CIC Bell DNS 2021 domain dataset as the primary training source.

Classes:
- benign
- phishing
- malware
- spam

Reason:
- Large dataset (>1M domains)
- Clearly labeled classes
- Suitable for offline feature extraction
- No live DNS lookups required for MVP

---

## Dataset Construction

Created:

data/processed/auspex_domains_v1.csv

Schema:

domain,label

Actions:
- Combined all four class datasets
- Standardized labels
- Removed duplicate domains with conflicting labels

Result:
~1.02 million labeled domains

---

## Feature Engineering (v1)

Created:

data/processed/auspex_features_v1.csv

Features:
- length
- digit_count
- digit_ratio
- hyphen_count
- dot_count
- tld
- starts_with_digit
- contains_www
- entropy

Observations:
- Malware and phishing domains are significantly longer than benign domains.
- Length appears to be a useful predictive feature.