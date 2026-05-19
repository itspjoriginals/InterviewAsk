import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { Toaster } from "react-hot-toast";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: { default: "InterviewAsk", template: "%s | InterviewAsk" },
  description: "Learn from real interview experiences, not just theory. Community-driven platform for developers.",
  keywords: ["interview", "preparation", "DSA", "frontend", "system design", "roadmap"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "InterviewAsk",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "14px",
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
