import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileView } from "@/components/profile/ProfileView";
import type { PostWithAuthor } from "@/types";

type UserWithPosts = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  points: number;
  role: string;
  createdAt: Date;
  posts: PostWithAuthor[];
  _count: { posts: number; comments: number };
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: user?.name || "Profile" };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true, role: true, points: true } },
          _count: { select: { comments: true, interactions: true } },
        },
      },
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProfileView user={user as UserWithPosts} isOwner={session?.user?.id === user.id} />
    </div>
  );
}
