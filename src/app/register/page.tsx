import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Join InterviewAsk</h1>
          <p className="text-muted-foreground mt-2">Share real experiences. Learn from community.</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
