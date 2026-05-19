"use client";
import Link from "next/link";
import { formatRelativeTime, POST_TYPE_CONFIG, DIFFICULTY_COLORS, ROLE_CONFIG } from "@/lib/utils";
import { ThumbsUp, MessageCircle, Eye, Bookmark, Building2 } from "lucide-react";
import type { PostWithAuthor } from "@/types";

export function PostCard({ post }: { post: PostWithAuthor }) {
  const typeConfig = POST_TYPE_CONFIG[post.type];
  const diffColor = post.difficulty ? DIFFICULTY_COLORS[post.difficulty] : null;
  const roleInfo = post.author.role ? ROLE_CONFIG[post.author.role as keyof typeof ROLE_CONFIG] : null;

  return (
    <Link href={`/post/${post.id}`}>
      <article className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 h-full flex flex-col">
        {/* Header badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${typeConfig.color}`}>
            {typeConfig.emoji} {typeConfig.label}
          </span>
          {post.difficulty && diffColor && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${diffColor}`}>
              {post.difficulty}
            </span>
          )}
          {post.company && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Building2 size={11} /> {post.company}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {post.title}
        </h3>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-2">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                {post.author.name[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{post.author.name}</span>
            {roleInfo && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${roleInfo.bg} ${roleInfo.color} font-medium`}>
                {roleInfo.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.upvotes}</span>
            <span className="flex items-center gap-1"><MessageCircle size={12} /> {post._count?.comments ?? 0}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
