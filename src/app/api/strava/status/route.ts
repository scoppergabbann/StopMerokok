import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { stravaCookieNames } from "@/lib/strava";

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(stravaCookieNames.refreshToken)?.value;
  const athleteName = cookieStore.get(stravaCookieNames.athleteName)?.value;
  const scope = cookieStore.get(stravaCookieNames.scope)?.value;

  return NextResponse.json({
    athleteName: athleteName || null,
    connected: Boolean(refreshToken),
    scope: scope || null,
  });
}
