import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your InterviewAsk account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
