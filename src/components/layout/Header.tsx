"use client";
import Link from 'next/link';
import { UserNav } from './UserNav';
import { BookOpenCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Eval-Lite</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
