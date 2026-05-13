export type LeadPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  employeeCount: string;
  mainNeed: string;
  consent: boolean;
  website?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  landing_page?: string;
  audience?: string;
  brand?: string;
  page_url?: string;
  referrer?: string;
};

type HubSpotEnv = {
  portalId?: string;
  formGuid?: string;
};

type SubmissionContext = {
  hutk?: string;
  pageUri?: string;
  pageName?: string;
  ipAddress?: string;
};

type ValidationResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; errors: Record<string, string> };

const requiredFields: Array<keyof LeadPayload> = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "company",
  "employeeCount",
  "mainNeed",
];

const fieldNameMap: Record<string, string> = {
  firstName: "firstname",
  lastName: "lastname",
  email: "email",
  phone: "phone",
  company: "company",
  employeeCount: "numemployees",
  mainNeed: "besoin_principal",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_content: "utm_content",
  utm_term: "utm_term",
  gclid: "gclid",
  landing_page: "landing_page",
  audience: "audience",
  brand: "brand",
  page_url: "page_url",
  referrer: "referrer",
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function validateLeadPayload(input: unknown): ValidationResult {
  const payload = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const lead: LeadPayload = {
    firstName: asString(payload.firstName),
    lastName: asString(payload.lastName),
    email: asString(payload.email).toLowerCase(),
    phone: asString(payload.phone),
    company: asString(payload.company),
    employeeCount: asString(payload.employeeCount),
    mainNeed: asString(payload.mainNeed),
    consent: asBoolean(payload.consent),
    website: asString(payload.website),
    utm_source: asString(payload.utm_source),
    utm_medium: asString(payload.utm_medium),
    utm_campaign: asString(payload.utm_campaign),
    utm_content: asString(payload.utm_content),
    utm_term: asString(payload.utm_term),
    gclid: asString(payload.gclid),
    landing_page: asString(payload.landing_page),
    audience: asString(payload.audience) || "ce_pme",
    brand: asString(payload.brand) || "hello_boost",
    page_url: asString(payload.page_url),
    referrer: asString(payload.referrer),
  };

  const errors: Record<string, string> = {};

  requiredFields.forEach((field) => {
    if (!lead[field]) {
      errors[field] = "Ce champ est obligatoire.";
    }
  });

  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.email = "L'adresse email n'est pas valide.";
  }

  if (lead.phone && lead.phone.replace(/[^\d+]/g, "").length < 8) {
    errors.phone = "Le numéro de téléphone semble incomplet.";
  }

  if (!lead.consent) {
    errors.consent = "Le consentement est obligatoire.";
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data: lead };
}

export function parseCookieHeader(cookieHeader: string | null) {
  return Object.fromEntries(
    (cookieHeader || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [name, ...rest] = item.split("=");
        return [decodeURIComponent(name), decodeURIComponent(rest.join("="))];
      }),
  );
}

function leadToHubSpotFields(lead: LeadPayload) {
  return Object.entries(fieldNameMap)
    .map(([leadKey, hubspotName]) => {
      const value = lead[leadKey as keyof LeadPayload];
      return typeof value === "string" && value ? { name: hubspotName, value } : null;
    })
    .filter((field): field is { name: string; value: string } => Boolean(field));
}

export async function submitLeadToHubSpot(lead: LeadPayload, env: HubSpotEnv, context: SubmissionContext) {
  if (!env.portalId || !env.formGuid) {
    throw new Error("HubSpot n'est pas configuré. Vérifiez HUBSPOT_PORTAL_ID et HUBSPOT_FORM_GUID.");
  }

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${env.portalId}/${env.formGuid}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: leadToHubSpotFields(lead),
      context: {
        hutk: context.hutk || undefined,
        pageUri: context.pageUri || lead.page_url || undefined,
        pageName: context.pageName || "Hello Boost - CE PME",
        ipAddress: context.ipAddress || undefined,
      },
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: "En envoyant ce formulaire, vous acceptez d'être recontacté au sujet de votre demande.",
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erreur HubSpot ${response.status}: ${body || response.statusText}`);
  }
}
