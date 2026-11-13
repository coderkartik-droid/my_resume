import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.userId) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        await prisma.adminSession.updateMany({
          where: { tokenHash, revoked: false },
          data: { revoked: true },
        }).catch(() => {});

        await prisma.auditLog.create({
          data: {
            userId: payload.userId,
            action: "LOGOUT",
            resource: "AdminSession",
            details: JSON.stringify({ username: payload.username }),
          },
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Logout handling error:", error);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
