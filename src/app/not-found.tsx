import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
            Go Home
          </Link>
          <Link href="/explore" className="px-5 py-2.5 rounded-xl border border-border bg-card font-medium text-sm hover:bg-muted transition-colors">
            Explore Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
