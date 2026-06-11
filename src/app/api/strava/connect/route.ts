import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getStravaConfig,
  getStravaCookieOptions,
  stravaCookieNames,
} from "@/lib/strava";

export async function GET(request: Request) {
  const { clientId } = getStravaConfig();
  const origin = new URL(request.url).origin;

  if (!clientId) {
    return NextResponse.redirect(`${origin}/activity?strava=missing-config`);
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(stravaCookieNames.state, state, getStravaCookieOptions(600));

  const authorizeUrl = new URL("https://www.strava.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set(
    "redirect_uri",
    `${origin}/api/strava/callback`,
  );
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("approval_prompt", "auto");
  authorizeUrl.searchParams.set("scope", "activity:read");
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
