import type { APIRoute } from "astro";
import { parseCookieHeader, submitLeadToHubSpot, validateLeadPayload } from "../../lib/hubspot";

export const prerender = false;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "Le format de la requête est invalide.",
      },
      400,
    );
  }

  const validation = validateLeadPayload(body);

  if (!validation.ok) {
    return jsonResponse(
      {
        success: false,
        message: "Merci de vérifier les champs obligatoires.",
        errors: validation.errors,
      },
      400,
    );
  }

  const lead = validation.data;

  if (lead.website) {
    return jsonResponse({
      success: true,
      message: "Votre demande a bien été reçue.",
    });
  }

  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim();

  try {
    await submitLeadToHubSpot(
      lead,
      {
        portalId: import.meta.env.HUBSPOT_PORTAL_ID,
        formGuid: import.meta.env.HUBSPOT_FORM_GUID,
      },
      {
        hutk: cookies.hubspotutk,
        pageUri: lead.page_url,
        pageName: "Hello Boost - CE PME",
        ipAddress,
      },
    );

    return jsonResponse({
      success: true,
      message: "Votre demande a bien été envoyée.",
    });
  } catch (error) {
    console.error("HubSpot submission failed", error);

    return jsonResponse(
      {
        success: false,
        message: "La demande n'a pas pu être envoyée pour le moment. Merci de réessayer dans quelques instants.",
      },
      502,
    );
  }
};

export const GET: APIRoute = () =>
  jsonResponse(
    {
      success: false,
      message: "Méthode non autorisée.",
    },
    405,
  );
