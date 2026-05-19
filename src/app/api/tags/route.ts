import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    select: { tags: true },
    where: { published: true },
  });

  const tagCount: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  const sorted = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([tag, count]) => ({ tag, count }));

  return NextResponse.json({ data: sorted });
}
