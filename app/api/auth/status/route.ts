import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";

export async function GET() {
  const adminAuth = await isAdminAuthenticated();

  const token = process.env.GH_TOKEN;
  let github = null;

  if (token) {
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (res.ok) {
        const user = await res.json();
        github = {
          login: user.login,
          avatar_url: user.avatar_url,
          name: user.name,
        };
      }
    } catch {
      // GitHub token invalid — still allow admin access via OTP
    }
  }

  return NextResponse.json({
    adminAuthenticated: adminAuth,
    authenticated: !!github,
    user: github,
  });
}
