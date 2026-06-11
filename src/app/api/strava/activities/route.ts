import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getStravaConfig,
  getStravaCookieOptions,
  stravaCookieNames,
  type StravaActivity,
  type StravaTokenResponse,
} from "@/lib/strava";

async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(stravaCookieNames.accessToken)?.value;
  const refreshToken = cookieStore.get(stravaCookieNames.refreshToken)?.value;
  const expiresAt = Number(cookieStore.get(stravaCookieNames.expiresAt)?.value);
  const { clientId, clientSecret } = getStravaConfig();
  const shouldRefresh =
    !accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now() / 1000 + 300;

  if (!shouldRefresh) {
    return accessToken;
  }

  if (!refreshToken || !clientId || !clientSecret) {
    return null;
  }

  const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  const token = (await response.json()) as StravaTokenResponse;
  const cookieOptions = getStravaCookieOptions();

  cookieStore.set(stravaCookieNames.accessToken, token.access_token, cookieOptions);
  cookieStore.set(stravaCookieNames.refreshToken, token.refresh_token, cookieOptions);
  cookieStore.set(
    stravaCookieNames.expiresAt,
    String(token.expires_at),
    cookieOptions,
  );

  return token.access_token;
}

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ activities: [], connected: false }, { status: 401 });
  }

  const after = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
  const activitiesUrl = new URL(
    "https://www.strava.com/api/v3/athlete/activities",
  );
  activitiesUrl.searchParams.set("after", String(after));
  activitiesUrl.searchParams.set("per_page", "10");

  const response = await fetch(activitiesUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { activities: [], connected: true, error: "fetch_failed" },
      { status: response.status },
    );
  }

  const activities = (await response.json()) as StravaActivity[];

  return NextResponse.json({
    activities: activities.map((activity) => ({
      distance: activity.distance,
      id: activity.id,
      movingTime: activity.moving_time,
      name: activity.name,
      sportType: activity.sport_type ?? activity.type,
      startDateLocal: activity.start_date_local,
    })),
    connected: true,
  });
}
