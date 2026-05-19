import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.interaction.findMany({
    where: { userId: session.user.id, type: "bookmark" },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, image: true, role: true, points: true } },
          _count: { select: { comments: true, interactions: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: bookmarks.map((b) => ({ ...b.post, isBookmarked: true })) });
}
