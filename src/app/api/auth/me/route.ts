import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Fetch current database state for mustChangePassword
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.userId as string },
    select: { id: true, username: true, mustChangePassword: true },
  });

  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: admin.id,
      username: admin.username,
      mustChangePassword: admin.mustChangePassword,
    },
  });
}
