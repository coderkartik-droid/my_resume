import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             req.headers.get("x-real-ip") ||
             "127.0.0.1";
  const userAgent = req.headers.get("user-agent")?.slice(0, 255) || "Unknown";

  try {
    // 1. Rate Limiting Check: Maximum 10 failed login attempts in past 15 minutes per IP
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFailedAttempts = await prisma.loginHistory.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentFailedAttempts >= 10) {
      return NextResponse.json(
        { error: "Too many failed login attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();

    // Check by exact or uppercase username
    let admin = await prisma.adminUser.findUnique({
      where: { username: cleanUsername },
    });

    if (!admin) {
      admin = await prisma.adminUser.findUnique({
        where: { username: cleanUsername.toUpperCase() },
      });
    }

    if (!admin) {
      // Record failed attempt in LoginHistory
      await prisma.loginHistory.create({
        data: {
          username: cleanUsername,
          ip,
          userAgent,
          success: false,
          failureReason: "ACCOUNT_NOT_FOUND",
        },
      });

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Record failed attempt in LoginHistory
      await prisma.loginHistory.create({
        data: {
          userId: admin.id,
          username: admin.username,
          ip,
          userAgent,
          success: false,
          failureReason: "INVALID_PASSWORD",
        },
      });

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Success - sign JWT token
    const token = await signToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
    });

    // Create session record in AdminSession with hashed token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.adminSession.create({
      data: {
        userId: admin.id,
        tokenHash,
        ip,
        userAgent,
        expiresAt,
      },
    });

    // Record successful login in LoginHistory
    await prisma.loginHistory.create({
      data: {
        userId: admin.id,
        username: admin.username,
        ip,
        userAgent,
        success: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      mustChangePassword: admin.mustChangePassword,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        mustChangePassword: admin.mustChangePassword,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
