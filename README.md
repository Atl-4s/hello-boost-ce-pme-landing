# Hello Boost - Landing CE PME

Landing page Astro pour une campagne Google Ads destinee aux TPE/PME recherchant une solution d'avantages salaries / CE externalise.

## Installation

```bash
npm install
```

## Lancement local

```bash
npm run dev
```

La landing principale est disponible sur `/ce-pme` et la page de confirmation sur `/merci`.

## Build et verification

```bash
npm run build
```

Le script lance `astro check` puis `astro build`.

## Variables d'environnement

Copier `.env.example` vers `.env` puis renseigner :

```bash
PUBLIC_GTM_ID=GTM-XXXXXXX
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_FORM_GUID=00000000-0000-0000-0000-000000000000
```

`PUBLIC_GTM_ID` est expose au navigateur par Astro. Les variables HubSpot restent cote serveur.

## Configuration HubSpot

L'API route `/api/submit-lead` envoie les donnees vers HubSpot Forms API :

```text
https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
```

Champs envoyes :

- `firstname`
- `lastname`
- `email`
- `phone`
- `company`
- `numemployees`
- `besoin_principal`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `gclid`
- `landing_page`
- `audience`
- `brand`
- `page_url`
- `referrer`

Le formulaire HubSpot doit contenir ces champs ou des proprietes compatibles. `besoin_principal`, les UTM, `gclid`, `landing_page`, `audience`, `brand`, `page_url` et `referrer` peuvent etre crees comme proprietes personnalisees si elles n'existent pas encore.

Le cookie `hubspotutk` est transmis dans le contexte HubSpot lorsqu'il est disponible.

## Configuration GTM

Renseigner `PUBLIC_GTM_ID`. Le layout global installe le script Google Tag Manager dans le `<head>` et le fallback `<noscript>` dans le `<body>`.

Evenements `dataLayer` disponibles :

- `cta_click`
- `form_start`
- `form_submit_success`
- `form_submit_error`
- `phone_click`
- `email_click`
- `thank_you_page_view`

`form_submit_success` est declenche uniquement apres une reponse positive de `/api/submit-lead`, puis l'utilisateur est redirige vers `/merci`.

## Attribution Google Ads

Le formulaire capture automatiquement :

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `gclid`
- `landing_page`
- `audience=ce_pme`
- `brand=hello_boost`
- `page_url`
- `referrer`

Les UTM et le `gclid` sont lus depuis l'URL puis conserves en `localStorage` pour ne pas les perdre avant la soumission.

## RGPD et anti-spam

Le formulaire inclut :

- case de consentement obligatoire
- texte court de traitement commercial
- honeypot invisible `website`
- validation front-end HTML
- validation back-end minimale
- messages d'erreur propres

## Deploiement Vercel

Le projet utilise `@astrojs/vercel` avec `output: "server"` pour rendre disponible l'API route serverless.

Sur Vercel :

1. Importer le repository.
2. Ajouter les variables d'environnement.
3. Garder la commande de build `npm run build`.
4. Deployer.

## Structure

```text
src/
  components/
  layouts/
  lib/
  pages/
    api/submit-lead.ts
  styles/
```
