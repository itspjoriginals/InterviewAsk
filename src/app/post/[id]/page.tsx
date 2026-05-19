import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { PostDetail } from "@/components/post/PostDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: post?.title || "Post" };
}

export default async function PostPage({ params }: { params: { id: string } }) {
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

  if (!post) notFound();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PostDetail
        post={{ ...post, isLiked, isBookmarked } as any}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
