"use client";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostCard } from "./PostCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { PostWithAuthor } from "@/types";
import { POST_TYPE_CONFIG } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Upvoted" },
  { value: "trending", label: "Trending" },
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const TYPE_OPTIONS = Object.entries(POST_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label, emoji: v.emoji }));

export function ExploreClient({
  initialPosts,
  initialTotal,
  popularTags,
}: {
  initialPosts: PostWithAuthor[];
  initialTotal: number;
  popularTags: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const buildQuery = useCallback((params: Record<string, string>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  }, []);

  const fetchPosts = useCallback(async (params: Record<string, string>, append = false) => {
    const qs = buildQuery(params);
    const res = await fetch(`/api/posts?${qs}`);
    const json = await res.json();
    if (append) {
      setPosts((prev) => [...prev, ...json.data]);
    } else {
      setPosts(json.data);
    }
    setTotal(json.total);
    return json;
  }, [buildQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    const params = { q: search, type, tag, difficulty, sort };
    await fetchPosts(params);
    router.push(`/explore?${buildQuery(params)}`, { scroll: false });
    setLoading(false);
  };

  const handleFilter = async (newParams: Partial<Record<string, string>>) => {
    setLoading(true);
    setPage(1);
    const params = { q: search, type, tag, difficulty, sort, ...newParams };
    if (newParams.type !== undefined) setType(newParams.type);
    if (newParams.tag !== undefined) setTag(newParams.tag);
    if (newParams.difficulty !== undefined) setDifficulty(newParams.difficulty);
    if (newParams.sort !== undefined) setSort(newParams.sort as string);
    await fetchPosts(params);
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const params = { q: search, type, tag, difficulty, sort, page: String(nextPage) };
    await fetchPosts(params, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const clearFilters = async () => {
    setSearch(""); setType(""); setTag(""); setDifficulty(""); setSort("newest");
    setLoading(true); setPage(1);
    const res = await fetch("/api/posts");
    const json = await res.json();
    setPosts(json.data); setTotal(json.total);
    router.push("/explore", { scroll: false });
    setLoading(false);
  };

  const hasFilters = search || type || tag || difficulty || sort !== "newest";

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Explore</h1>
        <p className="text-muted-foreground">{total.toLocaleString()} posts from the community</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, companies, topics..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
            Search
          </button>
        </div>
      </form>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
          <SlidersHorizontal size={15} /> Filters:
        </div>

        {/* Type filter */}
        {TYPE_OPTIONS.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => handleFilter({ type: type === value ? "" : value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              type === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {emoji} {label}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Difficulty */}
        {DIFFICULTY_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => handleFilter({ difficulty: difficulty === d ? "" : d })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              difficulty === d
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {d}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => handleFilter({ sort: e.target.value })}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Popular tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {popularTags.slice(0, 15).map((t) => (
          <button
            key={t}
            onClick={() => handleFilter({ tag: tag === t ? "" : t })}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              tag === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            #{t}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-5 bg-muted rounded w-full mb-2" />
              <div className="h-5 bg-muted rounded w-3/4 mb-4" />
              <div className="flex gap-2">
                <div className="h-5 bg-muted rounded w-16" />
                <div className="h-5 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>

          {posts.length < total && (
            <div className="mt-10 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : `Load More (${total - posts.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
