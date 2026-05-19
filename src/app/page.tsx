import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { PostCard } from "@/components/post/PostCard";
import { ArrowRight, BookOpen, Users, Zap, Star, TrendingUp, MessageCircle } from "lucide-react";

async function getStats() {
  const [posts, users, comments] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.comment.count(),
  ]);
  return { posts, users, comments };
}

async function getTrendingPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { upvotes: "desc" },
    take: 6,
    include: {
      author: { select: { id: true, name: true, image: true, role: true, points: true } },
      _count: { select: { comments: true, interactions: true } },
    },
  });
}

export default async function HomePage() {
  const session = await auth();
  const [stats, trending] = await Promise.all([getStats(), getTrendingPosts()]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/20 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="container max-w-6xl mx-auto px-4 py-24 md:py-36 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 border border-primary/20">
              <Zap size={14} className="text-primary" />
              Community-driven interview prep
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
              Learn from real
              <br />
              <span className="text-primary">interview experiences</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Not just theory. Real questions, real journeys, real outcomes — shared by developers who've been there.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-base"
              >
                Explore Posts <ArrowRight size={18} />
              </Link>
              {!session ? (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors text-base"
                >
                  Join the Community
                </Link>
              ) : (
                <Link
                  href="/post/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors text-base"
                >
                  Share Experience
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-8">
            {[
              { label: "Posts Shared", value: stats.posts.toLocaleString(), icon: BookOpen },
              { label: "Members", value: stats.users.toLocaleString(), icon: Users },
              { label: "Discussions", value: stats.comments.toLocaleString(), icon: MessageCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-2">
                  <Icon size={20} />
                </div>
                <div className="font-display text-3xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
              <TrendingUp size={16} /> Trending
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Top Posts This Week</h2>
          </div>
          <Link
            href="/explore"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trending.map((post) => (
            <PostCard key={post.id} post={post as any} />
          ))}
        </div>
      </section>

      {/* CTA */}
      {!session && (
        <section className="border-t border-border bg-card">
          <div className="container max-w-6xl mx-auto px-4 py-20 text-center">
            <Star size={32} className="text-primary mx-auto mb-4" />
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Ready to contribute?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Share your interview experience and help thousands of developers prepare better.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-base"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-bold text-lg text-foreground">InterviewAsk</div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} InterviewAsk. Built for developers, by developers.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Join</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
