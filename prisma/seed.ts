import { PrismaClient, PostType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: hashedPassword,
      bio: "Senior Frontend Engineer at Google. Passionate about React & performance.",
      points: 450,
      role: "MENTOR",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Chen",
      email: "bob@example.com",
      password: hashedPassword,
      bio: "SDE2 at Amazon. Love system design and distributed systems.",
      points: 210,
      role: "ADVANCED",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      name: "Carol Patel",
      email: "carol@example.com",
      password: hashedPassword,
      bio: "Final year CS student preparing for placements.",
      points: 55,
      role: "CONTRIBUTOR",
    },
  });

  // Create posts
  const posts = [
    {
      title: "Google L4 Frontend Interview Experience – React + DSA",
      content: `## Overview
Interviewed for L4 SWE Frontend at Google Bangalore in October 2024. The process took about 6 weeks total.

## Round 1: Phone Screen (45 min)
Focused on JavaScript fundamentals. Was asked:
- Implement a debounce function from scratch
- Explain event loop and microtasks vs macrotasks
- How does prototypal inheritance work?

The interviewer was friendly and gave hints when I was stuck.

## Round 2: Technical (60 min) – Coding
Pure DSA round. Problems:
1. **Sliding window maximum** – solved in O(n) using deque
2. **LRU Cache** – implemented with HashMap + doubly linked list

## Round 3: Technical (60 min) – System Design
Design a real-time collaborative document editor (like Google Docs). I focused on:
- Operational Transformation vs CRDTs
- WebSocket architecture
- Conflict resolution

## Round 4: Googleyness & Leadership (45 min)
Behavioral round. Be ready with STAR format stories about:
- Handling disagreements with teammates
- Delivering projects under pressure
- Taking ownership beyond your role

## Tips
- Practice LC medium/hard daily for 3 months
- Review JavaScript engine internals
- Google values communication over just getting the answer

## Outcome
**SELECTED** 🎉 – Joining Jan 2025`,
      type: PostType.EXPERIENCE,
      company: "Google",
      role: "SWE L4 – Frontend",
      outcome: "Selected",
      difficulty: "Hard",
      tags: ["Google", "Frontend", "React", "JavaScript", "DSA", "System Design"],
      upvotes: 142,
      views: 2840,
      authorId: alice.id,
    },
    {
      title: "Amazon SDE2 System Design Round – Deep Dive",
      content: `## The Problem
Design a URL shortener like bit.ly that handles 100M URLs/day.

## My Approach

### Requirements Clarification
- Read:Write ratio ~100:1
- URL expiry support needed
- Analytics (clicks, geo) nice to have
- Availability > Consistency

### High Level Design
\`\`\`
Client → API Gateway → App Servers → DB
                                  → Cache (Redis)
                        ↓
                    Analytics Queue (Kafka)
                        ↓
                    Analytics Service
\`\`\`

### Key Decisions
1. **ID Generation**: Used base62 encoding of auto-increment ID. Discussed Snowflake for distributed IDs.
2. **Database**: Cassandra for URL mappings (high write throughput, natural partition by hash)
3. **Cache**: Redis with LRU eviction. Cache top 20% URLs (covers 80% traffic)
4. **Analytics**: Async Kafka pipeline to avoid blocking reads

### Deep Dives
Interviewer asked about:
- Handling hash collisions
- Cache invalidation strategy
- Rate limiting per user

## Outcome
**SELECTED** ✅`,
      type: PostType.EXPERIENCE,
      company: "Amazon",
      role: "SDE2 – Backend",
      outcome: "Selected",
      difficulty: "Hard",
      tags: ["Amazon", "System Design", "Backend", "Distributed Systems", "SDE2"],
      upvotes: 98,
      views: 1920,
      authorId: bob.id,
    },
    {
      title: "Complete Frontend Interview Preparation Roadmap (2024–25)",
      content: `# Frontend Interview Roadmap

A structured 16-week plan to crack frontend interviews at top companies.

## Phase 1: JavaScript Mastery (Weeks 1–4)
- [ ] Execution context, call stack, closures
- [ ] Prototypes, classes, inheritance
- [ ] Event loop, promises, async/await
- [ ] this keyword in all contexts
- [ ] Implement: debounce, throttle, curry, memoize, deep clone

## Phase 2: React & State Management (Weeks 5–8)
- [ ] Reconciliation algorithm & fiber
- [ ] All hooks in depth (useCallback, useMemo, useRef, useEffect)
- [ ] Context API vs Redux vs Zustand
- [ ] Performance: React.memo, code splitting, lazy loading
- [ ] Implement a mini useState/useEffect from scratch

## Phase 3: Web Fundamentals (Weeks 9–10)
- [ ] How browsers render pages (critical rendering path)
- [ ] CSS: specificity, BFC, stacking context, flexbox vs grid
- [ ] Web APIs: localStorage, IndexedDB, Service Workers, WebSockets
- [ ] Core Web Vitals & performance metrics

## Phase 4: DSA for Frontend (Weeks 11–13)
- [ ] Arrays, strings, hashmaps – must do 50+ problems
- [ ] Trees & graphs (DOM traversal, BFS/DFS)
- [ ] Top LC patterns: sliding window, two pointers, recursion

## Phase 5: System Design for Frontend (Weeks 14–15)
- [ ] Design a news feed
- [ ] Design autocomplete
- [ ] Design an infinite scroll list
- [ ] Design a real-time chat UI

## Phase 6: Mock Interviews & Polish (Week 16)
- [ ] 10+ mock interviews with peers
- [ ] Behavioral stories (STAR format, 5 stories minimum)
- [ ] Review all rejected/failed problems

## Resources
- **JS**: javascript.info, You Don't Know JS (free on GitHub)
- **React**: Official docs, Kent C. Dodds blog
- **DSA**: Neetcode.io, LC Top 150
- **System Design**: Frontend System Design interviews by Greatfrontend`,
      type: PostType.ROADMAP,
      tags: ["Frontend", "React", "JavaScript", "Roadmap", "Career", "Interview Prep"],
      upvotes: 234,
      views: 5600,
      authorId: alice.id,
    },
    {
      title: "What is the difference between useCallback and useMemo?",
      content: `## Question
Explain \`useCallback\` vs \`useMemo\` with real examples. When should you use each?

## Answer

Both hooks memoize values to prevent unnecessary recalculations. The difference is **what** they memoize:

### useCallback
Memoizes a **function reference**.

\`\`\`jsx
const handleSubmit = useCallback(() => {
  submitForm(formData);
}, [formData]);
\`\`\`

Use when: passing callbacks to child components wrapped in \`React.memo\`. Without it, the child re-renders even if props didn't logically change.

### useMemo
Memoizes a **computed value**.

\`\`\`jsx
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
\`\`\`

Use when: expensive computation inside render that depends on specific deps.

### The Mental Model
- **useCallback(fn, deps)** = **useMemo(() => fn, deps)**
- They are literally the same thing, useCallback is just syntactic sugar

### When NOT to use them
- Don't wrap every function/value – memoization itself has cost
- Only memoize when there's a measured performance issue or referential equality matters

## Difficulty
Medium – commonly asked at mid-level and senior frontend interviews.`,
      type: PostType.QUESTION,
      difficulty: "Medium",
      tags: ["React", "Hooks", "Frontend", "JavaScript", "Performance"],
      upvotes: 87,
      views: 3100,
      authorId: bob.id,
    },
    {
      title: "Flipkart SDE1 Interview – Rejected but Learned a Lot",
      content: `## Background
Fresh grad, 6 months of prep. Applied to Flipkart SDE1 in Bengaluru.

## Round 1: Online Assessment (90 min)
3 coding problems:
1. Easy array problem – solved
2. Medium DP problem – partially solved
3. Hard graph problem – couldn't complete

Cleared to next rounds somehow.

## Round 2: Technical Interview 1 (60 min)
- Find all pairs in array with given sum – solved O(n)
- Explain how HashMap works internally – answered well
- Write a function to flatten nested object – solved

Felt good after this round.

## Round 3: Technical Interview 2 (60 min)
This is where it went wrong.
- Design a notification system (LLD) – I panicked, didn't structure well
- I skipped clarifying questions and jumped to implementation
- Interviewer had to constantly redirect me

## Round 4: HR Round
Went fine but got the rejection email 3 days later.

## What I Learned
1. **LLD is as important as DSA** – practice SOLID principles
2. **Always clarify before coding** – requirements matter
3. **Communication > Perfect code** – explain your thought process
4. **Rejection isn't the end** – I cracked Razorpay 2 months later

## Takeaway
Don't skip LLD/HLD preparation. Most candidates focus only on LC and fail system design rounds.`,
      type: PostType.EXPERIENCE,
      company: "Flipkart",
      role: "SDE1",
      outcome: "Rejected",
      difficulty: "Medium",
      tags: ["Flipkart", "SDE1", "Fresher", "DSA", "LLD", "Learning"],
      upvotes: 201,
      views: 4200,
      authorId: carol.id,
    },
    {
      title: "DSA Roadmap for Freshers – Land Your First Tech Job",
      content: `# DSA Roadmap for Freshers (0–6 months)

This roadmap helped me crack Razorpay and Zomato. No prior CP experience needed.

## Month 1: Foundations
**Goal**: Get comfortable with patterns, not memorize solutions.

### Week 1–2: Arrays & Strings
- Two pointers technique
- Sliding window
- Prefix sums
- Practice: 20 easy problems on LC

### Week 3–4: Recursion & Backtracking
- Understand the call stack mentally
- Subsets, permutations, combinations
- Practice: 15 medium problems

## Month 2: Core Data Structures
**Goal**: Implement from scratch, then use built-ins.

### Linked Lists (Week 1)
- Reverse, detect cycle (Floyd's), merge sorted
- Must know: dummy node trick

### Stacks & Queues (Week 2)
- Monotonic stack pattern
- Implement LRU Cache

### Trees (Weeks 3–4)
- BFS, DFS, level order
- BST operations
- Path sum problems

## Month 3: Advanced Topics
- Heaps & Priority Queue
- Graphs: BFS/DFS, Dijkstra, Union-Find
- Dynamic Programming (start with 1D, then 2D)

## Month 4–5: LC Grinding
- Target: 150+ problems (60% medium, 20% hard)
- Neetcode 150 list is gold
- Blind 75 for a shorter list

## Month 6: Interview Simulation
- Mock interviews daily
- Time yourself strictly (45 min per problem)
- Review failures deeply

## Key Resources
- **Neetcode.io** – best video explanations
- **LC Premium** – company-specific questions
- **Striver's A2Z DSA Course** – comprehensive for beginners`,
      type: PostType.ROADMAP,
      tags: ["DSA", "Algorithms", "Fresher", "SDE1", "Roadmap", "Career"],
      upvotes: 312,
      views: 8900,
      authorId: carol.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log("✅ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  alice@example.com / password123 (Mentor)");
  console.log("  bob@example.com   / password123 (Advanced)");
  console.log("  carol@example.com / password123 (Contributor)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
