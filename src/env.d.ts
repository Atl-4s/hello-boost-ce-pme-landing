/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GTM_ID?: string;
  readonly HUBSPOT_PORTAL_ID?: string;
  readonly HUBSPOT_FORM_GUID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
