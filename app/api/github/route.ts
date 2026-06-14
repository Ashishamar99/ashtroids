import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GH_TOKEN;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ash-teroids",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const allRepos: unknown[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = token
        ? `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner`
        : `https://api.github.com/users/${process.env.GH_USERNAME || "Ashishamar99"}/repos?per_page=${perPage}&page=${page}&sort=updated`;

      const res = await fetch(url, { headers });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { error: `GitHub API error: ${res.status}`, details: err },
          { status: res.status }
        );
      }

      const repos = await res.json();
      if (!Array.isArray(repos) || repos.length === 0) break;

      allRepos.push(...repos);
      if (repos.length < perPage) break;
      page++;
    }

    return NextResponse.json({
      repos: allRepos,
      authenticated: !!token,
      count: allRepos.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch repos", details: String(error) },
      { status: 500 }
    );
  }
}
