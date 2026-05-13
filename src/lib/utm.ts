export const attributionFieldNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "landing_page",
  "audience",
  "brand",
  "page_url",
  "referrer",
] as const;

type AttributionFieldName = (typeof attributionFieldNames)[number];
type AttributionPayload = Record<AttributionFieldName, string>;

const queryParamNames = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"] as const;
const storageKey = "hello_boost_attribution";

function readStoredAttribution(): Partial<AttributionPayload> {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "{}") as Partial<AttributionPayload>;
  } catch {
    return {};
  }
}

function writeStoredAttribution(payload: Partial<AttributionPayload>) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // localStorage can be unavailable in strict privacy contexts.
  }
}

export function collectAttribution(): AttributionPayload {
  const params = new URLSearchParams(window.location.search);
  const stored = readStoredAttribution();
  const next: Partial<AttributionPayload> = { ...stored };

  queryParamNames.forEach((key) => {
    const value = params.get(key);
    if (value) {
      next[key] = value;
    }
  });

  if (!next.landing_page) {
    next.landing_page = window.location.pathname;
  }

  if (!next.referrer && document.referrer) {
    next.referrer = document.referrer;
  }

  next.audience = "ce_pme";
  next.brand = "hello_boost";
  next.page_url = window.location.href;
  next.referrer = next.referrer || "";

  writeStoredAttribution(next);

  return {
    utm_source: next.utm_source || "",
    utm_medium: next.utm_medium || "",
    utm_campaign: next.utm_campaign || "",
    utm_content: next.utm_content || "",
    utm_term: next.utm_term || "",
    gclid: next.gclid || "",
    landing_page: next.landing_page || window.location.pathname,
    audience: "ce_pme",
    brand: "hello_boost",
    page_url: window.location.href,
    referrer: next.referrer || "",
  };
}

export function hydrateAttributionFields(form: HTMLFormElement) {
  const attribution = collectAttribution();

  attributionFieldNames.forEach((fieldName) => {
    const input = form.querySelector<HTMLInputElement>(`input[name="${fieldName}"]`);
    if (input) {
      input.value = attribution[fieldName];
    }
  });

  return attribution;
}
