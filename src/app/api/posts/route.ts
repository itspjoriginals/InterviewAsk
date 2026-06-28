import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PostType, UserRole } from "@prisma/client";
import { POINTS_CONFIG } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(20),
  type: z.nativeEnum(PostType),
  company: z.string().optional(),
  role: z.string().optional(),
  outcome: z.string().optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).max(8),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") as PostType | null;
  const company = searchParams.get("company") || "";
  const tag = searchParams.get("tag") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 12;

  const where: any = { published: true };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (company) where.company = { contains: company, mode: "insensitive" };
  if (tag) where.tags = { has: tag };
  if (difficulty) where.difficulty = difficulty;

  const orderBy =
    sort === "popular"
      ? { upvotes: "desc" as const }
      : sort === "trending"
      ? { views: "desc" as const }
      : { createdAt: "desc" as const };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, name: true, image: true, role: true, points: true } },
        _count: { select: { comments: true, interactions: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  // Check session for liked/bookmarked
  const session = await auth();
  let postsWithStatus = posts;
  if (session?.user?.id) {
    const interactions = await prisma.interaction.findMany({
      where: { userId: session.user.id, postId: { in: posts.map((p) => p.id) } },
    });
    postsWithStatus = posts.map((p) => ({
      ...p,
      isLiked: interactions.some((i) => i.postId === p.id && i.type === "like"),
      isBookmarked: interactions.some((i) => i.postId === p.id && i.type === "bookmark"),
    }));
  }

  return NextResponse.json({
    data: postsWithStatus,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: { ...parsed.data, authorId: session.user.id },
      include: {
        author: { select: { id: true, name: true, image: true, role: true, points: true } },
      },
    });

    // Award points and update role
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: POINTS_CONFIG.POST_CONTENT } },
    });

    await updateUserRole(user.id, user.points + POINTS_CONFIG.POST_CONTENT);

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function updateUserRole(userId: string, points: number) {
  let role: UserRole = "BEGINNER";
  if (points >= 400) role = "MENTOR";
  else if (points >= 200) role = "ADVANCED";
  else if (points >= 50) role = "CONTRIBUTOR";
  await prisma.user.update({ where: { id: userId }, data: { role } });
}
