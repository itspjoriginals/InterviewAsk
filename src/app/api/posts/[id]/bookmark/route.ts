import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: RouteContext<'/api/posts/[id]/bookmark'>
) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.interaction.findUnique({
    where: { userId_postId_type: { userId: session.user.id, postId: id, type: "bookmark" } },
  });

  if (existing) {
    await prisma.interaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  } else {
    await prisma.interaction.create({
      data: { userId: session.user.id, postId: id, type: "bookmark" },
    });
    return NextResponse.json({ bookmarked: true });
  }
}
