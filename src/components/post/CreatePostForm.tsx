"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X, Plus } from "lucide-react";
import { POST_TYPE_CONFIG } from "@/lib/utils";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Flipkart", "Razorpay", "Zomato", "Swiggy", "Infosys", "TCS", "Wipro", "Paytm", "PhonePe", "CRED", "Other"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const OUTCOMES = ["Selected", "Rejected", "Pending", "Withdrew"];
const SUGGESTED_TAGS = ["DSA", "Frontend", "Backend", "React", "JavaScript", "TypeScript", "Python", "Java", "System Design", "LLD", "HLD", "Fresher", "SDE1", "SDE2", "Senior", "Roadmap", "Career"];

const TYPE_OPTIONS = Object.entries(POST_TYPE_CONFIG).map(([k, v]) => ({
  value: k, label: v.label, emoji: v.emoji,
  desc: k === "EXPERIENCE" ? "Share your interview journey" : k === "QUESTION" ? "Post an interview question" : "Create a learning roadmap",
}));

export function CreatePostForm({ defaultType }: { defaultType?: string }) {
  const router = useRouter();
  const [type, setType] = useState(defaultType || "EXPERIENCE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [outcome, setOutcome] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type, company: company || undefined, role: role || undefined, outcome: outcome || undefined, difficulty: difficulty || undefined, tags }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success("Post published! +10 points 🎉");
      router.push(`/post/${json.data.id}`);
    } else {
      toast.error(json.error || "Failed to publish");
      setSubmitting(false);
    }
  };

  const PLACEHOLDER = type === "EXPERIENCE"
    ? `## Overview\nBriefly describe the company, role, and interview timeline.\n\n## Round 1: [Round Name]\nDescribe what happened, questions asked...\n\n## Tips\nWhat would you tell someone preparing for the same role?\n\n## Outcome\n**Selected/Rejected** – your thoughts`
    : type === "QUESTION"
    ? `## The Question\nState the interview question clearly.\n\n## My Approach\nExplain how you thought about it...\n\n## Solution\n\`\`\`javascript\n// Your code here\n\`\`\`\n\n## Key Insight\nWhat's the trick or important concept?`
    : `# [Your Roadmap Title]\n\n## Phase 1: [Topic] (Week 1–2)\n- [ ] Learn X\n- [ ] Practice Y\n\n## Resources\n- Best books, courses, sites`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Post Type</label>
        <div className="grid grid-cols-3 gap-3">
          {TYPE_OPTIONS.map(({ value, label, emoji, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                type === value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="text-xl mb-1">{emoji}</div>
              <div className="font-semibold text-sm text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-destructive">*</span></label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "EXPERIENCE" ? "e.g. Google L4 Frontend Interview Experience" : type === "QUESTION" ? "e.g. What is the difference between useCallback and useMemo?" : "e.g. Complete Frontend Roadmap 2025"}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
          maxLength={200}
        />
        <div className="text-xs text-muted-foreground text-right mt-1">{title.length}/200</div>
      </div>

      {/* Experience-specific fields */}
      {type === "EXPERIENCE" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
              <option value="">Select company</option>
              {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. SDE2 – Frontend" className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Outcome</label>
            <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
              <option value="">Select outcome</option>
              {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
              <option value="">Select difficulty</option>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      )}

      {type === "QUESTION" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button key={d} type="button" onClick={() => setDifficulty(d === difficulty ? "" : d)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-foreground">Content <span className="text-destructive">*</span></label>
          <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-primary hover:underline">
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[300px] px-4 py-3 rounded-xl border border-border bg-card prose-ia text-sm" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={16}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y font-mono text-sm transition-colors"
          />
        )}
        <p className="text-xs text-muted-foreground mt-1">Supports Markdown: **bold**, `code`, ```code blocks```, ## headings, - lists</p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Tags <span className="text-muted-foreground">(max 8)</span></label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              #{tag} <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
            placeholder="Add a tag..."
            className="flex-1 px-4 py-2 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
          <button type="button" onClick={() => addTag(tagInput)} className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 10).map((t) => (
            <button key={t} type="button" onClick={() => addTag(t)} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
