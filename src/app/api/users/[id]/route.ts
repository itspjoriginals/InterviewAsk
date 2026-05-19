import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, image: true, bio: true,
      points: true, role: true, createdAt: true,
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { comments: true, interactions: true } } },
      },
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schema = z.object({
    name: z.string().min(2).max(50).optional(),
    bio: z.string().max(300).optional(),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, bio: true, image: true, role: true, points: true },
  });

  return NextResponse.json({ data: user });
}
