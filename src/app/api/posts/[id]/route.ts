import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true, role: true, points: true, bio: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { comments: true, interactions: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment views
  await prisma.post.update({ where: { id: params.id }, data: { views: { increment: 1 } } });

  let isLiked = false;
  let isBookmarked = false;
  if (session?.user?.id) {
    const interactions = await prisma.interaction.findMany({
      where: { userId: session.user.id, postId: params.id },
    });
    isLiked = interactions.some((i) => i.type === "like");
    isBookmarked = interactions.some((i) => i.type === "bookmark");
  }

  return NextResponse.json({ data: { ...post, isLiked, isBookmarked } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}
