export type TrackingEventName =
  | "cta_click"
  | "form_start"
  | "form_submit_success"
  | "form_submit_error"
  | "phone_click"
  | "email_click"
  | "thank_you_page_view";

type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushDataLayer(event: TrackingEventName, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...payload,
  });
}

export function bindTrackedLinks() {
  if (typeof document === "undefined") {
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-track-cta]").forEach((element) => {
    if (element.dataset.trackingBound === "true") {
      return;
    }

    element.dataset.trackingBound = "true";
    element.addEventListener("click", () => {
      pushDataLayer("cta_click", {
        cta_text: element.textContent?.trim() || element.getAttribute("aria-label") || "cta",
        cta_location: element.dataset.ctaLocation || "unknown",
        cta_target: element.getAttribute("href") || element.dataset.ctaTarget || null,
      });
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach((link) => {
    if (link.dataset.phoneTrackingBound === "true") {
      return;
    }

    link.dataset.phoneTrackingBound = "true";
    link.addEventListener("click", () => {
      pushDataLayer("phone_click", {
        link_url: link.href,
        link_text: link.textContent?.trim() || "telephone",
      });
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]').forEach((link) => {
    if (link.dataset.emailTrackingBound === "true") {
      return;
    }

    link.dataset.emailTrackingBound = "true";
    link.addEventListener("click", () => {
      pushDataLayer("email_click", {
        link_url: link.href,
        link_text: link.textContent?.trim() || "email",
      });
    });
  });
}
