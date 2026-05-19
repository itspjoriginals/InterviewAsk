# InterviewAsk – Setup Guide

Community-driven platform for sharing real interview experiences, questions, and preparation roadmaps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Radix UI primitives |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| ORM | Prisma |
| Database | PostgreSQL |
| Deploy | Vercel + Neon/Supabase |

---

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+ (local or cloud)
- Git

---

## Local Development Setup

### 1. Clone / Extract the project

```bash
cd interviewask
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in values:

```env
# Required — your PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/interviewask"

# Required — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional — for Google OAuth (see section below)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

**Option A — Using local PostgreSQL:**

```bash
# Create the database
createdb interviewask

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

**Option B — Using Prisma migrations (recommended for teams):**

```bash
npm run db:generate
npm run db:migrate    # creates migration files
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| alice@example.com | password123 | Mentor |
| bob@example.com | password123 | Advanced |
| carol@example.com | password123 | Contributor |

---

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials → Create OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret** to `.env`

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:push          # Push schema changes without migration
npm run db:migrate       # Create and apply migrations
npm run db:studio        # Open Prisma Studio (GUI for DB)
npm run db:seed          # Seed demo data

# Linting
npm run lint             # Run ESLint
```

---

## Project Structure

```
interviewask/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth + register
│   │   │   ├── posts/      # CRUD, like, bookmark, comments
│   │   │   ├── users/      # Profile, bookmarks
│   │   │   └── tags/       # Popular tags
│   │   ├── dashboard/      # User dashboard (protected)
│   │   ├── explore/        # Browse all posts
│   │   ├── login/          # Auth pages
│   │   ├── register/
│   │   ├── post/
│   │   │   ├── new/        # Create post (protected)
│   │   │   └── [id]/       # Post detail
│   │   └── profile/[id]/   # User profile
│   ├── components/
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   ├── layout/         # Navbar, ThemeProvider, SessionProvider
│   │   ├── post/           # PostCard, PostDetail, ExploreClient, CreatePostForm
│   │   └── profile/        # ProfileView
│   ├── lib/
│   │   ├── prisma.ts       # Prisma singleton
│   │   └── utils.ts        # Helpers, constants
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── auth.ts             # NextAuth config
│   └── middleware.ts       # Route protection
├── .env.example
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Deployment

### Deploy to Vercel + Neon (Recommended)

#### Step 1: Database — Neon (free tier)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project → copy the **Connection string**
3. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

#### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/interviewask.git
git push -u origin main
```

#### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add environment variables:

```
DATABASE_URL          = postgresql://...  (from Neon)
NEXTAUTH_SECRET       = <run: openssl rand -base64 32>
NEXTAUTH_URL          = https://your-app.vercel.app
GOOGLE_CLIENT_ID      = (optional)
GOOGLE_CLIENT_SECRET  = (optional)
NEXT_PUBLIC_APP_URL   = https://your-app.vercel.app
```

5. Click **Deploy**

#### Step 4: Run DB migrations after deploy

In Vercel dashboard → **Settings → General → Build Command**, or use Vercel CLI:

```bash
npm i -g vercel
vercel env pull .env.local
npx prisma db push
npx tsx prisma/seed.ts   # optional: seed demo data
```

---

### Alternative: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → **Deploy from GitHub repo**
3. Add a **PostgreSQL** plugin
4. Copy the `DATABASE_URL` from the plugin
5. Add all environment variables in the **Variables** tab
6. Railway auto-deploys on every push

---

### Alternative: Render

1. Go to [render.com](https://render.com)
2. New → **Web Service** → Connect GitHub
3. Build Command: `npm install && npm run db:generate && npm run build`
4. Start Command: `npm run start`
5. Add a **PostgreSQL** database service
6. Set all environment variables

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection URL |
| `NEXTAUTH_SECRET` | ✅ Yes | Random secret for JWT signing |
| `NEXTAUTH_URL` | ✅ Yes | Full URL of your app |
| `GOOGLE_CLIENT_ID` | ⬜ Optional | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ⬜ Optional | For Google OAuth |
| `NEXT_PUBLIC_APP_URL` | ⬜ Optional | Public app URL for SEO |

---

## Gamification System

| Action | Points Earned |
|---|---|
| Publish a post | +10 |
| Your post gets upvoted | +2 per upvote |
| Post a comment | +1 |

| Rank | Points Required |
|---|---|
| Beginner | 0 |
| Contributor | 50 |
| Advanced | 200 |
| Mentor | 400 |

---

## Features Implemented

- ✅ Email/password authentication
- ✅ Google OAuth
- ✅ JWT sessions via NextAuth v5
- ✅ Create/read/delete posts (Experience, Question, Roadmap)
- ✅ Markdown content rendering
- ✅ Like / unlike posts
- ✅ Bookmark / save posts
- ✅ Comments with live updates
- ✅ Search by keyword, filter by type, tag, difficulty
- ✅ Sort by newest, most upvoted, trending
- ✅ Paginated load more
- ✅ Gamification: points + rank system
- ✅ User profiles with edit
- ✅ Dashboard with stats, saved posts, quick actions
- ✅ Dark / light mode
- ✅ Responsive mobile-first design
- ✅ Protected routes via middleware
- ✅ View counter on posts
- ✅ Popular tags sidebar
- ✅ SEO meta tags

---

## Troubleshooting

**`PrismaClientInitializationError`**
→ Check your `DATABASE_URL` is correct and the database exists.

**`NEXTAUTH_SECRET` error**
→ Generate one: `openssl rand -base64 32` and add to `.env`

**`Cannot find module '@/...'`**
→ Run `npm run db:generate` to regenerate Prisma types

**Google OAuth redirect mismatch**
→ Add exact callback URL to Google Cloud Console:
`http://localhost:3000/api/auth/callback/google`

**Seed fails with unique constraint**
→ The seed uses `upsert` so it's safe to run multiple times. If issues persist:
```bash
npx prisma db push --force-reset
npm run db:seed
```
