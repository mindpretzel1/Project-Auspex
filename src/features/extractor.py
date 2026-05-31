"""Extract the V1 lexical feature schema expected by the saved Auspex model."""

from __future__ import annotations

import math
import re
from collections import Counter
from urllib.parse import urlsplit


FEATURE_COLUMNS = [
    "domain",
    "length",
    "digit_count",
    "digit_ratio",
    "dot_count",
    "tld",
    "starts_with_digit",
    "contains_www",
    "entropy",
    "hyphen_count",
]

_DOMAIN_RE = re.compile(r"^[a-z0-9.-]+$")


def normalize_domain(value: str) -> str:
    """Return a lowercase host/domain string from a user-entered domain or URL."""

    if not isinstance(value, str):
        raise ValueError("Domain must be a string.")

    raw_value = value.strip().lower()
    if not raw_value:
        raise ValueError("Enter a domain to analyze.")

    if "://" in raw_value:
        parsed = urlsplit(raw_value)
    else:
        parsed = urlsplit(f"//{raw_value}")

    domain = parsed.hostname or parsed.path.split("/")[0]
    domain = domain.strip().rstrip(".")

    if not domain:
        raise ValueError("Enter a valid domain.")

    try:
        domain = domain.encode("idna").decode("ascii")
    except UnicodeError as exc:
        raise ValueError("Enter a valid domain.") from exc

    if len(domain) > 253:
        raise ValueError("Domain is too long.")
    if any(part == "" for part in domain.split(".")):
        raise ValueError("Domain cannot contain empty labels.")
    if not _DOMAIN_RE.fullmatch(domain):
        raise ValueError("Domain may only contain letters, numbers, dots, and hyphens.")
    if any(part.startswith("-") or part.endswith("-") for part in domain.split(".")):
        raise ValueError("Domain labels cannot start or end with a hyphen.")

    return domain


def _shannon_entropy(value: str) -> float:
    if not value:
        return 0.0

    counts = Counter(value)
    length = len(value)
    return -sum((count / length) * math.log2(count / length) for count in counts.values())


def extract_features(domain: str) -> dict[str, str | int | float]:
    """Extract the exact V1 schema required by models/auspex_model.pkl."""

    normalized_domain = normalize_domain(domain)
    length = len(normalized_domain)
    digit_count = sum(character.isdigit() for character in normalized_domain)

    return {
        "domain": normalized_domain,
        "length": length,
        "digit_count": digit_count,
        "digit_ratio": digit_count / length if length else 0.0,
        "dot_count": normalized_domain.count("."),
        "tld": normalized_domain.rsplit(".", 1)[-1] if "." in normalized_domain else "",
        "starts_with_digit": int(normalized_domain[0].isdigit()),
        "contains_www": int("www" in normalized_domain),
        "entropy": _shannon_entropy(normalized_domain),
        "hyphen_count": normalized_domain.count("-"),
    }
