import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { POINTS_CONFIG } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  context: RouteContext<'/api/posts/[id]/like'>
) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.interaction.findUnique({
    where: { userId_postId_type: { userId: session.user.id, postId: id, type: "like" } },
  });

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, upvotes: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing) {
    // Unlike
    await prisma.interaction.delete({ where: { id: existing.id } });
    const updated = await prisma.post.update({
      where: { id },
      data: { upvotes: { decrement: 1 } },
      select: { upvotes: true },
    });
    // Remove points from author
    await prisma.user.update({
      where: { id: post.authorId },
      data: { points: { decrement: POINTS_CONFIG.GET_UPVOTE } },
    });
    return NextResponse.json({ liked: false, upvotes: updated.upvotes });
  } else {
    // Like
    await prisma.interaction.create({
      data: { userId: session.user.id, postId: id, type: "like" },
    });
    const updated = await prisma.post.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
      select: { upvotes: true },
    });
    await prisma.user.update({
      where: { id: post.authorId },
      data: { points: { increment: POINTS_CONFIG.GET_UPVOTE } },
    });
    return NextResponse.json({ liked: true, upvotes: updated.upvotes });
  }
}
