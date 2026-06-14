import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json(
      { error: "OTP auth not configured" },
      { status: 500 }
    );
  }

  const { code } = await request.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { error: "Code is required" },
      { status: 400 }
    );
  }

  const result = verifyOTP(adminEmail, code.trim());

  if (!result.valid) {
    return NextResponse.json(
      { error: result.error },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  await setSessionCookie(token);

  return NextResponse.json({ authenticated: true });
}
