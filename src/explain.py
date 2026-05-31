"""Human-readable explanation rules for Auspex model outputs."""

from __future__ import annotations


AUTH_TOKENS = {"login", "verify", "secure", "account", "password", "reset", "auth"}
FINANCE_TOKENS = {
    "bank",
    "paypal",
    "payment",
    "wallet",
    "invoice",
    "billing",
    "credit",
    "debit",
    "crypto",
}
URGENCY_TOKENS = {"update", "urgent", "alert", "warning", "locked", "suspend", "expire"}


def _matching_tokens(domain: str, tokens: set[str]) -> list[str]:
    return sorted(token for token in tokens if token in domain)


def generate_explanation(
    domain: str,
    features: dict[str, str | int | float],
    probabilities: dict[str, float],
) -> list[str]:
    """Create careful, feature-based explanations without exposing model internals."""

    reasons: list[str] = []

    if int(features["length"]) >= 25:
        reasons.append("The domain is unusually long, a pattern associated with some risky domains.")
    if int(features["hyphen_count"]) >= 2:
        reasons.append("Multiple hyphens may indicate a generated or impersonation-style domain.")
    if float(features["digit_ratio"]) > 0.15:
        reasons.append("A high proportion of digits contributed to a higher risk score.")
    if float(features["entropy"]) >= 3.7:
        reasons.append("Elevated character randomness may indicate a less natural domain string.")
    if int(features["starts_with_digit"]) == 1:
        reasons.append("The domain starts with a digit, which is uncommon for many benign brands.")
    if int(features["contains_www"]) == 1:
        reasons.append("The domain contains `www` within the domain string.")

    auth_tokens = _matching_tokens(domain, AUTH_TOKENS)
    finance_tokens = _matching_tokens(domain, FINANCE_TOKENS)
    urgency_tokens = _matching_tokens(domain, URGENCY_TOKENS)

    if auth_tokens:
        reasons.append(
            "Authentication-related wording may indicate account-access lures: "
            + ", ".join(auth_tokens)
            + "."
        )
    if finance_tokens:
        reasons.append(
            "Finance-related wording is associated with common impersonation themes: "
            + ", ".join(finance_tokens)
            + "."
        )
    if urgency_tokens:
        reasons.append(
            "Urgency-related wording may be used to pressure users: "
            + ", ".join(urgency_tokens)
            + "."
        )

    benign_probability = probabilities.get("benign", 0.0)
    if benign_probability < 0.35:
        reasons.append("The model assigned a low benign probability.")
    elif benign_probability > 0.75:
        reasons.append("The model assigned a high benign probability, lowering the risk score.")

    if not reasons:
        reasons.append("No strong lexical risk signals were extracted from the domain.")

    return reasons[:6]
