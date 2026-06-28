import { Navbar } from "@/components/layout/Navbar";
import { ExploreClient } from "@/components/post/ExploreClient";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Explore" };

async function getInitialData(searchParams: Record<string, string | string[] | undefined>) {
  const type = searchParams.type as string | undefined;
  const q = (searchParams.q as string) || "";
  const tag = (searchParams.tag as string) || "";
  const sort = (searchParams.sort as string) || "newest";

  const where: any = { published: true };
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { company: { contains: q, mode: "insensitive" } },
  ];
  if (type) where.type = type;
  if (tag) where.tags = { has: tag };

  const orderBy = sort === "popular" ? { upvotes: "desc" as const }
    : sort === "trending" ? { views: "desc" as const }
    : { createdAt: "desc" as const };

  const [posts, total, tags] = await Promise.all([
    prisma.post.findMany({
      where, orderBy, take: 12,
      include: {
        author: { select: { id: true, name: true, image: true, role: true, points: true } },
        _count: { select: { comments: true, interactions: true } },
      },
    }),
    prisma.post.count({ where }),
    prisma.post.findMany({ select: { tags: true }, where: { published: true } }),
  ]);

  const tagCount: Record<string, number> = {};
  for (const p of tags) for (const t of p.tags) tagCount[t] = (tagCount[t] || 0) + 1;
  const popularTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([t]) => t);

  return { posts, total, popularTags };
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const { posts, total, popularTags } = await getInitialData(resolvedSearchParams);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ExploreClient initialPosts={posts as any} initialTotal={total} popularTags={popularTags} />
    </div>
  );
}
