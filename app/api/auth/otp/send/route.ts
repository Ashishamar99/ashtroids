import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateOTP } from "@/lib/otp";

export async function POST() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!adminEmail || !resendKey) {
    return NextResponse.json(
      { error: "OTP auth not configured" },
      { status: 500 }
    );
  }

  const { code, cooldown } = generateOTP(adminEmail);

  if (cooldown) {
    return NextResponse.json(
      { error: "Please wait before requesting another code" },
      { status: 429 }
    );
  }

  const resend = new Resend(resendKey);

  const { error } = await resend.emails.send({
    from: "ASH-TEROIDS <onboarding@resend.dev>",
    to: adminEmail,
    subject: `Your admin code: ${code}`,
    html: `
      <div style="font-family: monospace; background: #030014; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <p style="color: #6b8db5; font-size: 11px; letter-spacing: 2px;">// ADMIN_ACCESS_CODE</p>
        <h1 style="font-size: 48px; letter-spacing: 12px; margin: 20px 0; color: #ffffff;">${code}</h1>
        <p style="color: #64748b; font-size: 13px;">This code expires in 5 minutes.</p>
        <hr style="border-color: #1e293b; margin: 20px 0;" />
        <p style="color: #475569; font-size: 11px;">ASH-TEROIDS Admin</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send OTP email:", error);
    return NextResponse.json(
      { error: "Failed to send code" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sent: true });
}
