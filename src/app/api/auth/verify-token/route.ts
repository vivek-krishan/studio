// src/app/api/auth/verify-token/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { sessionCookie } = await request.json();

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Session cookie not provided' }, { status: 400 });
    }

    // Verify the session cookie. This will throw an error if invalid.
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    
    // Return necessary claims, like role. Avoid sending the entire token.
    return NextResponse.json({ role: decodedToken.role, uid: decodedToken.uid });
  } catch (error) {
    console.error('API verify-token error:', error);
    // If verification fails, return an unauthorized status.
    // The middleware will handle cookie deletion.
    return NextResponse.json({ error: 'Invalid session cookie' }, { status: 401 });
  }
}
