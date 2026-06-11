import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getStravaConfig,
  getStravaCookieOptions,
  stravaCookieNames,
  type StravaTokenResponse,
} from "@/lib/strava";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const { clientId, clientSecret } = getStravaConfig();
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stravaCookieNames.state)?.value;

  if (error) {
    return NextResponse.redirect(`${origin}/activity?strava=denied`);
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/activity?strava=invalid-state`);
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/activity?strava=missing-config`);
  }

  const tokenResponse = await fetch("https://www.strava.com/api/v3/oauth/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    method: "POST",
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(`${origin}/activity?strava=token-failed`);
  }

  const token = (await tokenResponse.json()) as StravaTokenResponse;
  const athleteName = [token.athlete?.firstname, token.athlete?.lastname]
    .filter(Boolean)
    .join(" ");
  const cookieOptions = getStravaCookieOptions();

  cookieStore.set(stravaCookieNames.accessToken, token.access_token, cookieOptions);
  cookieStore.set(stravaCookieNames.refreshToken, token.refresh_token, cookieOptions);
  cookieStore.set(
    stravaCookieNames.expiresAt,
    String(token.expires_at),
    cookieOptions,
  );
  cookieStore.set(stravaCookieNames.scope, token.scope ?? "", cookieOptions);

  if (athleteName) {
    cookieStore.set(stravaCookieNames.athleteName, athleteName, cookieOptions);
  }

  cookieStore.delete(stravaCookieNames.state);

  return NextResponse.redirect(`${origin}/activity?strava=connected`);
}
