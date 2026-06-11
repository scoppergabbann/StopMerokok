import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStravaConfig, stravaCookieNames } from "@/lib/strava";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(stravaCookieNames.refreshToken)?.value;
  const { clientId, clientSecret } = getStravaConfig();

  if (refreshToken && clientId && clientSecret) {
    const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    await fetch("https://www.strava.com/oauth/revoke", {
      body: new URLSearchParams({
        token: refreshToken,
        token_type_hint: "refresh_token",
      }),
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    }).catch(() => undefined);
  }

  Object.values(stravaCookieNames).forEach((name) => cookieStore.delete(name));

  return NextResponse.json({ connected: false });
}
