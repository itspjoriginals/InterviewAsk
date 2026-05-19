import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { POINTS_CONFIG } from "@/lib/utils";

const schema = z.object({ content: z.string().min(2).max(2000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { content: parsed.data.content, authorId: session.user.id, postId: id },
    include: { author: { select: { id: true, name: true, image: true, role: true } } },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { points: { increment: POINTS_CONFIG.COMMENT } },
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}
