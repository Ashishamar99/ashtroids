import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: false, error: "Token invalid" });
    }

    const user = await res.json();
    return NextResponse.json({
      authenticated: true,
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, error: "Failed to verify" });
  }
}
