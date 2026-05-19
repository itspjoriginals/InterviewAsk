import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/post/PostCard";
import { ROLE_CONFIG } from "@/lib/utils";
import { BookmarkIcon, Edit, TrendingUp, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { select: { id: true, name: true, image: true, role: true, points: true } },
          _count: { select: { comments: true, interactions: true } },
        },
      },
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) redirect("/login");

  const roleInfo = ROLE_CONFIG[user.role];
  const roles = Object.values(ROLE_CONFIG);
  const currentIdx = roles.findIndex((r) => r.label === roleInfo.label);
  const nextRole = roles[currentIdx + 1];
  const progressPct = nextRole
    ? Math.min(100, ((user.points - roleInfo.min) / (nextRole.min - roleInfo.min)) * 100)
    : 100;

  const bookmarks = await prisma.interaction.findMany({
    where: { userId: user.id, type: "bookmark" },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, image: true, role: true, points: true } },
          _count: { select: { comments: true, interactions: true } },
        },
      },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-6xl mx-auto px-4 py-10">
        {/* Welcome header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your community.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Posts", value: user._count.posts, icon: FileText, href: `/profile/${user.id}` },
                { label: "Points", value: user.points, icon: TrendingUp, href: "#" },
                { label: "Comments", value: user._count.comments, icon: MessageSquare, href: "#" },
              ].map(({ label, value, icon: Icon, href }) => (
                <Link key={label} href={href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                  <Icon size={20} className="text-muted-foreground mb-2" />
                  <div className="font-display text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </Link>
              ))}
            </div>

            {/* My Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">My Posts</h2>
                <Link href="/post/new" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Edit size={14} /> New Post
                </Link>
              </div>
              {user.posts.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted anything yet.</p>
                  <Link href="/post/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                    Share Your First Experience
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.posts.map((post) => <PostCard key={post.id} post={post as any} />)}
                  {user._count.posts > 5 && (
                    <Link href={`/profile/${user.id}`} className="block text-center text-sm text-muted-foreground hover:text-foreground py-2">
                      View all {user._count.posts} posts →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rank card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Your Rank</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.bg} ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
              <div className="text-3xl font-display font-bold text-foreground mb-1">{user.points} pts</div>
              {nextRole && (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2 mt-3">
                    <span>{roleInfo.label}</span>
                    <span>{nextRole.label} ({nextRole.min} pts)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {nextRole.min - user.points} points to {nextRole.label}
                  </p>
                </>
              )}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  📝 Post = +10 pts &nbsp;&nbsp; 👍 Upvote = +2 pts &nbsp;&nbsp; 💬 Comment = +1 pt
                </p>
              </div>
            </div>

            {/* Saved posts */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookmarkIcon size={16} className="text-muted-foreground" />
                <h3 className="font-display font-bold text-foreground">Saved Posts</h3>
              </div>
              {bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map(({ post }) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="block">
                      <p className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{post.type}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { href: "/post/new", label: "Share Interview Experience", emoji: "🏢" },
                  { href: "/post/new?type=QUESTION", label: "Post an Interview Question", emoji: "❓" },
                  { href: "/post/new?type=ROADMAP", label: "Create a Roadmap", emoji: "🗺️" },
                  { href: "/explore", label: "Explore Community", emoji: "🔍" },
                ].map(({ href, label, emoji }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                    <span>{emoji}</span> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
