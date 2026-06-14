import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminAuthenticated } from "@/lib/session";

const CONFIG_PATH = path.join(process.cwd(), "data", "ashteroids.json");

export async function GET() {
  try {
    const content = await fs.readFile(CONFIG_PATH, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json(
      { error: "Config file not found" },
      { status: 404 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.githubUsername || !body.repos || !body.manualProjects) {
      return NextResponse.json(
        { error: "Invalid config structure" },
        { status: 400 }
      );
    }

    const json = JSON.stringify(body, null, 2) + "\n";
    await fs.writeFile(CONFIG_PATH, json);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save config", details: String(error) },
      { status: 500 }
    );
  }
}
