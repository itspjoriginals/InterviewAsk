import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CreatePostForm } from "@/components/post/CreatePostForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Create Post" };

export default async function NewPostPage({ searchParams }: { searchParams: { type?: string } }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/post/new");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Create Post</h1>
          <p className="text-muted-foreground mt-2">Share your knowledge with the community</p>
        </div>
        <CreatePostForm defaultType={searchParams.type} />
      </div>
    </div>
  );
}
