"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { PostCard } from "@/components/post/PostCard";
import { formatDate, ROLE_CONFIG, POST_TYPE_CONFIG } from "@/lib/utils";
import { Calendar, Edit2, Check, X, MapPin } from "lucide-react";
import type { PostWithAuthor } from "@/types";

type UserWithPosts = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  points: number;
  role: string;
  createdAt: Date | string;
  posts: PostWithAuthor[];
  _count: { posts: number; comments: number };
};

export function ProfileView({ user, isOwner }: { user: UserWithPosts; isOwner: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const roleInfo = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.BEGINNER;

  const roles = Object.values(ROLE_CONFIG);
  const currentIdx = roles.findIndex((r) => r.label === roleInfo.label);
  const nextRole = roles[currentIdx + 1];
  const progressPct = nextRole
    ? Math.min(100, ((user.points - roleInfo.min) / (nextRole.min - roleInfo.min)) * 100)
    : 100;

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });
    if (res.ok) {
      toast.success("Profile updated!");
      setEditing(false);
    } else {
      toast.error("Failed to update");
    }
    setSaving(false);
  };

  const filteredPosts = activeTab === "all"
    ? user.posts
    : user.posts.filter((p) => p.type === activeTab);

  const postCounts = {
    all: user.posts.length,
    EXPERIENCE: user.posts.filter((p) => p.type === "EXPERIENCE").length,
    QUESTION: user.posts.filter((p) => p.type === "QUESTION").length,
    ROADMAP: user.posts.filter((p) => p.type === "ROADMAP").length,
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-3xl font-display font-bold flex-shrink-0">
                {user.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-display text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary focus:outline-none w-full mb-2"
                />
              ) : (
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">{user.name}</h1>
              )}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${roleInfo.bg} ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar size={13} /> Joined {formatDate(user.createdAt)}
                </span>
              </div>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Tell the community about yourself..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {user.bio || (isOwner ? "Add a bio to tell others about yourself..." : "No bio yet.")}
                </p>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
                    <Check size={14} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => { setEditing(false); setName(user.name); setBio(user.bio || ""); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
                  <Edit2 size={14} /> Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
          {[
            { label: "Posts", value: user._count.posts },
            { label: "Points", value: user.points },
            { label: "Comments", value: user._count.comments },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Rank progress */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={`font-semibold ${roleInfo.color}`}>{roleInfo.label}</span>
            {nextRole && <span className="text-muted-foreground">{nextRole.label} at {nextRole.min} pts</span>}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{user.points} pts earned</span>
            {nextRole && <span>{nextRole.min - user.points} pts to go</span>}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-muted rounded-xl w-fit">
          {[
            { key: "all", label: "All" },
            { key: "EXPERIENCE", label: "🏢 Experiences" },
            { key: "QUESTION", label: "❓ Questions" },
            { key: "ROADMAP", label: "🗺️ Roadmaps" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label} ({postCounts[key as keyof typeof postCounts]})
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-muted-foreground">No posts in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
}
