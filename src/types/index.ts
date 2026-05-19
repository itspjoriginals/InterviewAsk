import { Post, User, Comment, Interaction, PostType, UserRole } from "@prisma/client";

export type { PostType, UserRole };

export type PostWithAuthor = Post & {
  author: Pick<User, "id" | "name" | "image" | "role" | "points">;
  _count?: { comments: number; interactions: number };
  isLiked?: boolean;
  isBookmarked?: boolean;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "image" | "role">;
};

export type UserProfile = User & {
  posts: Post[];
  _count: { posts: number; comments: number };
};

export type CreatePostInput = {
  title: string;
  content: string;
  type: PostType;
  company?: string;
  role?: string;
  outcome?: string;
  difficulty?: string;
  tags: string[];
};

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SearchParams = {
  q?: string;
  type?: PostType;
  company?: string;
  tag?: string;
  difficulty?: string;
  page?: number;
  sort?: "newest" | "popular" | "trending";
};
