export async function onRequest(context: { request: Request }): Promise<Response> {
  // Handle CORS preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-id",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const clientId = "7a1689ca-faaf-4057-b729-f8560ca25ec8";
  const clientSecret = "qfcs_53749fa9852c4b62b791adea549c45ca659dbd43532641779ab8c9101a347e59";

  try {
    const authHeader = "Basic " + btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch("https://prelive-oauth2.quran.foundation/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "content",
      }).toString(),
    });

    const data = await tokenRes.text();
    return new Response(data, {
      status: tokenRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "token_fetch_failed",
        message: error?.message || "Failed to fetch OAuth2 token from Quran.Foundation",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
