"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Globe2,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SAMPLE_DOMAINS = [
  "google.com",
  "paypal-secure-login-update.com",
  "xk29qz7vbn-login-update.ru",
];

const CLASS_ORDER = ["benign", "malware", "phishing", "spam"] as const;

type RiskBand = "Low" | "Medium" | "High";

type AnalysisResult = {
  domain: string;
  prediction: string;
  risk_score: number;
  risk_band: RiskBand;
  probabilities: Record<string, number>;
  explanation: string[];
  features: {
    length: number;
    digit_count: number;
    digit_ratio: number;
    dot_count: number;
    tld: string;
    starts_with_digit: number;
    contains_www: number;
    entropy: number;
    hyphen_count: number;
  };
};

function bandClasses(band: RiskBand) {
  if (band === "Low") {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      bar: "bg-emerald-600",
    };
  }

  if (band === "Medium") {
    return {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      bar: "bg-amber-500",
    };
  }

  return {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    bar: "bg-red-600",
  };
}

function probabilityColor(label: string) {
  if (label === "benign") return "bg-emerald-600";
  if (label === "phishing") return "bg-red-600";
  if (label === "malware") return "bg-orange-600";
  return "bg-sky-600";
}

function formatPercent(value = 0) {
  return `${Math.round(value * 100)}%`;
}

function getAnatomy(domain: string) {
  const parts = domain.split(".").filter(Boolean);
  const tld = parts.length > 1 ? parts[parts.length - 1] : "";
  const sld = parts.length > 1 ? parts[parts.length - 2] : domain;
  const subdomainCount = Math.max(parts.length - 2, 0);

  return { sld, tld, subdomainCount };
}

export default function Home() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const anatomy = useMemo(() => (result ? getAnatomy(result.domain) : null), [result]);
  const riskClasses = result ? bandClasses(result.risk_band) : bandClasses("Low");

  async function analyze(nextDomain = domain) {
    const trimmedDomain = nextDomain.trim();
    if (!trimmedDomain) {
      setError("Enter a domain to analyze.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmedDomain }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || "Auspex could not analyze this domain.");
      }

      const payload = (await response.json()) as AnalysisResult;
      setResult(payload);
      setDomain(payload.domain);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    analyze();
  }

  function handleSample(sample: string) {
    setDomain(sample);
    analyze(sample);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-auspex-teal shadow-sm">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Project Auspex
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold text-auspex-ink sm:text-5xl">
              Explainable Domain Intelligence
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              Analyze domain names using lexical signals and character-level ML patterns.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Activity className="h-4 w-4 text-auspex-teal" aria-hidden="true" />
            MVP triage model
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel sm:p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
              <label className="sr-only" htmlFor="domain">
                Enter a domain
              </label>
              <div className="relative flex-1">
                <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="domain"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="paypal-secure-login-update.com"
                  className="h-12 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base text-auspex-ink outline-none transition focus:border-auspex-teal focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-md bg-auspex-ink px-5 text-sm font-semibold text-white transition hover:bg-auspex-graphite disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                Analyze Domain
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {SAMPLE_DOMAINS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleSample(sample)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-auspex-teal"
                >
                  {sample}
                </button>
              ))}
            </div>

            {error ? (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            ) : null}
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-panel sm:p-5">
            <p className="font-semibold text-auspex-ink">Model note</p>
            <p className="mt-2 leading-6">
              Auspex is an MVP triage tool. Results are based on lexical domain features and
              should be reviewed before operational use.
            </p>
          </aside>
        </section>

        {result ? (
          <section className="grid gap-6 lg:grid-cols-3">
            <div
              className={`rounded-lg border ${riskClasses.border} ${riskClasses.bg} p-5 shadow-panel`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">Risk Score</p>
                <Gauge className={`h-5 w-5 ${riskClasses.text}`} aria-hidden="true" />
              </div>
              <div className={`mt-4 text-5xl font-semibold ${riskClasses.text}`}>
                {result.risk_score}
                <span className="text-xl text-slate-500"> / 100</span>
              </div>
              <div className="mt-4 h-2 w-full rounded-sm bg-white">
                <div
                  className={`h-2 rounded-sm ${riskClasses.bar}`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
              <p className={`mt-4 text-lg font-semibold ${riskClasses.text}`}>
                {result.risk_band}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">Prediction</p>
                <ShieldAlert className="h-5 w-5 text-auspex-ink" aria-hidden="true" />
              </div>
              <p className="mt-5 break-words text-3xl font-semibold uppercase text-auspex-ink">
                {result.prediction}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Model-derived classification for the normalized domain.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">Domain</p>
                <Globe2 className="h-5 w-5 text-auspex-teal" aria-hidden="true" />
              </div>
              <p className="mt-5 break-all text-2xl font-semibold text-auspex-ink">
                {result.domain}
              </p>
              <p className="mt-4 text-sm text-slate-600">TLD: {result.features.tld || "n/a"}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:col-span-2">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-auspex-ink">Confidence Breakdown</h2>
                <CheckCircle2 className="h-5 w-5 text-auspex-teal" aria-hidden="true" />
              </div>
              <div className="space-y-4">
                {CLASS_ORDER.map((label) => {
                  const value = result.probabilities[label] || 0;
                  return (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold capitalize text-slate-700">{label}</span>
                        <span className="font-semibold text-slate-600">{formatPercent(value)}</span>
                      </div>
                      <div className="h-3 w-full rounded-sm bg-slate-100">
                        <div
                          className={`h-3 rounded-sm ${probabilityColor(label)}`}
                          style={{ width: `${Math.max(2, value * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <h2 className="text-lg font-semibold text-auspex-ink">Why Auspex flagged this</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {result.explanation.map((reason) => (
                  <li key={reason} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-auspex-teal" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:col-span-3">
              <h2 className="text-lg font-semibold text-auspex-ink">Domain Anatomy</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Domain", result.domain],
                  ["SLD", anatomy?.sld || "n/a"],
                  ["TLD", anatomy?.tld || "n/a"],
                  ["Subdomain count", anatomy?.subdomainCount ?? 0],
                  ["Length", result.features.length],
                  ["Entropy", result.features.entropy.toFixed(2)],
                  ["Hyphens", result.features.hyphen_count],
                  ["Digits", result.features.digit_count],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-slate-200 pb-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
                    <dd className="mt-1 break-all text-base font-semibold text-auspex-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:col-span-2">
              <h2 className="text-lg font-semibold text-auspex-ink">Analysis results</h2>
              <div className="mt-5 grid min-h-52 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Enter a domain to see risk score, confidence, explanation, and technical features.
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <h2 className="text-lg font-semibold text-auspex-ink">Classes</h2>
              <div className="mt-4 space-y-3">
                {CLASS_ORDER.map((label) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-700">{label}</span>
                    <span className={`h-2.5 w-2.5 rounded-sm ${probabilityColor(label)}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
