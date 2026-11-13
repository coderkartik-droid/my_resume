import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (newPassword === "KARTIK12") {
      return NextResponse.json(
        { error: "Please choose a new, custom password different from your initial setup password" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId as string },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    // Record change in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "PASSWORD_CHANGE",
        resource: "AdminUser",
        resourceId: admin.id,
        details: JSON.stringify({ username: admin.username, success: true }),
      },
    }).catch(() => {});

    // Re-issue updated token
    const token = await signToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role,
      mustChangePassword: false,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully! First-time security verification cleared.",
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating password" },
      { status: 500 }
    );
  }
}
