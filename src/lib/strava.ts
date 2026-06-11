export type StravaActivity = {
  distance: number;
  id: number;
  moving_time: number;
  name: string;
  sport_type?: string;
  start_date_local: string;
  type: string;
};

export type StravaTokenResponse = {
  access_token: string;
  athlete?: {
    firstname?: string;
    lastname?: string;
  };
  expires_at: number;
  refresh_token: string;
  scope?: string;
  token_type: string;
};

export const stravaCookieNames = {
  accessToken: "stopmerokok.strava.access_token",
  athleteName: "stopmerokok.strava.athlete_name",
  expiresAt: "stopmerokok.strava.expires_at",
  refreshToken: "stopmerokok.strava.refresh_token",
  scope: "stopmerokok.strava.scope",
  state: "stopmerokok.strava.state",
};

export function getStravaConfig() {
  return {
    clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? "",
    clientSecret: process.env.STRAVA_CLIENT_SECRET ?? "",
  };
}

export function getStravaCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function formatMovingTime(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} menit`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes ? `${hours}j ${restMinutes}m` : `${hours} jam`;
}

export function metersToKm(meters: number) {
  return meters / 1000;
}
