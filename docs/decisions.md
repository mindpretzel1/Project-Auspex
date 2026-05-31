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