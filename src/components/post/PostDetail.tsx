"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { formatDate, formatRelativeTime, POST_TYPE_CONFIG, DIFFICULTY_COLORS, ROLE_CONFIG } from "@/lib/utils";
import { ThumbsUp, Bookmark, MessageCircle, Eye, Calendar, Building2, Briefcase, ArrowLeft, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PostWithAuthor, CommentWithAuthor } from "@/types";

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[uh\d]|<li|<pre|<block)(.+)$/gm, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gm, '<hr>');
}

export function PostDetail({
  post,
  currentUserId,
}: {
  post: PostWithAuthor & { comments: CommentWithAuthor[]; isLiked: boolean; isBookmarked: boolean };
  currentUserId?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [liked, setLiked] = useState(post.isLiked);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const typeConfig = POST_TYPE_CONFIG[post.type];
  const diffColor = post.difficulty ? DIFFICULTY_COLORS[post.difficulty] : null;
  const authorRole = post.author.role ? ROLE_CONFIG[post.author.role as keyof typeof ROLE_CONFIG] : null;

  const handleLike = async () => {
    if (!session) { toast.error("Sign in to like posts"); return; }
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const json = await res.json();
    setLiked(json.liked);
    setUpvotes(json.upvotes);
    toast.success(json.liked ? "Liked!" : "Unliked");
  };

  const handleBookmark = async () => {
    if (!session) { toast.error("Sign in to save posts"); return; }
    const res = await fetch(`/api/posts/${post.id}/bookmark`, { method: "POST" });
    const json = await res.json();
    setBookmarked(json.bookmarked);
    toast.success(json.bookmarked ? "Saved!" : "Removed from saved");
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error("Sign in to comment"); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) {
      const json = await res.json();
      setComments((prev) => [...prev, json.data]);
      setCommentText("");
      toast.success("Comment added! +1 point");
    } else {
      toast.error("Failed to comment");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Post deleted");
      router.push("/dashboard");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <article>
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${typeConfig.color}`}>
            {typeConfig.emoji} {typeConfig.label}
          </span>
          {post.difficulty && diffColor && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${diffColor}`}>{post.difficulty}</span>
          )}
          {post.outcome && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
              post.outcome === "Selected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              post.outcome === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
              "bg-muted text-muted-foreground border-border"
            }`}>
              {post.outcome === "Selected" ? "✅" : post.outcome === "Rejected" ? "❌" : "⏳"} {post.outcome}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          {post.company && (
            <span className="flex items-center gap-1.5"><Building2 size={14} /> {post.company}</span>
          )}
          {post.role && (
            <span className="flex items-center gap-1.5"><Briefcase size={14} /> {post.role}</span>
          )}
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1.5"><Eye size={14} /> {post.views.toLocaleString()} views</span>
        </div>

        {/* Author */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {post.author.name[0]}
              </div>
            )}
            <div>
              <div className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">{post.author.name}</div>
              {authorRole && (
                <span className={`text-xs font-medium ${authorRole.color}`}>{authorRole.label}</span>
              )}
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                liked ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <ThumbsUp size={15} /> {upvotes}
            </button>
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg border transition-colors ${
                bookmarked ? "border-amber-300 bg-amber-50 text-amber-600" : "border-border bg-card text-muted-foreground hover:border-amber-300"
              }`}
            >
              <Bookmark size={15} />
            </button>
            <button onClick={handleShare} className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
              <Share2 size={15} />
            </button>
            {currentUserId === post.authorId && (
              <button onClick={handleDelete} className="p-2 rounded-lg border border-border bg-card text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/explore?tag=${tag}`} className="text-xs text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-md transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose-ia text-base leading-relaxed mb-12"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Comments */}
        <div className="border-t border-border pt-10">
          <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-muted-foreground" />
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h2>

          {/* Comment form */}
          {session ? (
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm transition-colors"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-opacity"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 rounded-xl bg-muted text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link> to join the discussion
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-5">
            {comments.map((comment) => {
              const cRole = comment.author.role ? ROLE_CONFIG[comment.author.role as keyof typeof ROLE_CONFIG] : null;
              return (
                <div key={comment.id} className="flex gap-3">
                  {comment.author.image ? (
                    <img src={comment.author.image} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {comment.author.name[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{comment.author.name}</span>
                      {cRole && <span className={`text-xs font-medium ${cRole.color}`}>{cRole.label}</span>}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
