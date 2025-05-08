"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'teacher') {
        router.replace('/teacher/dashboard');
      } else if (userProfile.role === 'student') {
        router.replace('/student/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || (user && !userProfile)) { // Still loading or user exists but profile doesn't yet
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Eval-Lite...</p>
      </div>
    );
  }
  
  // If user is logged in and profile is loaded, useEffect will redirect.
  // This content is for unauthenticated users or users whose profile is loading.
  if (user && userProfile) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-secondary to-background p-6 text-center">
      <BookOpenCheck className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl">
        Welcome to Eval-Lite
      </h1>
      <p className="mt-6 max-w-2xl text-xl text-foreground/80">
        The future of AI-powered answer evaluation. Streamline assessments, provide instant feedback, and enhance learning outcomes.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" asChild className="shadow-lg">
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="shadow-lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
      <p className="mt-12 text-sm text-muted-foreground">
        Built with cutting-edge AI for educators and students.
      </p>
    </div>
  );
}
