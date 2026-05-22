import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json(
      { error: tokenData.error_description || tokenData.error },
      { status: 400 }
    );
  }

  const token = tokenData.access_token;

  // Write token to .env.local for persistence
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf-8");
    } catch {
      // file doesn't exist yet
    }

    const lines = envContent.split("\n").filter(Boolean);
    const filtered = lines.filter((l) => !l.startsWith("GITHUB_TOKEN="));
    filtered.push(`GITHUB_TOKEN=${token}`);
    await fs.writeFile(envPath, filtered.join("\n") + "\n");

    // Also set in process.env for immediate use
    process.env.GITHUB_TOKEN = token;
  } catch {
    // In production, filesystem is read-only — token only lives in memory
    process.env.GITHUB_TOKEN = token;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/admin?connected=true`);
}
