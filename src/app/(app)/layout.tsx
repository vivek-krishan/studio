"use client";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  // Additional check to ensure userProfile is loaded before rendering role-specific content
  useEffect(() => {
    if (!loading && user && !userProfile) {
      // This might indicate an issue or delay in fetching profile.
      // For now, we allow rendering, but a more robust app might show a specific loading/error state.
      console.warn("User authenticated but profile not yet loaded.");
    }
  }, [user, userProfile, loading]);


  if (loading || (!user && typeof window !== 'undefined')) { // ensure user check is meaningful post-hydration
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the useEffect redirect,
     // but acts as a fallback or for server-side rendering scenarios before hydration.
    return null; // Or a redirect component if preferred for SSR
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Eval-Lite. All rights reserved.
      </footer>
    </div>
  );
}
