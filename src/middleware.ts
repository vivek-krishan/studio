import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin'; // Using admin SDK for server-side auth verification

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isStudentPage = pathname.startsWith('/student');
  const isTeacherPage = pathname.startsWith('/teacher');
  const isApiRoute = pathname.startsWith('/api');

  if (isApiRoute) {
    return NextResponse.next(); // Allow API routes
  }

  if (!sessionCookie) {
    if (isAuthPage || pathname === '/') {
      return NextResponse.next(); // Allow access to auth pages and landing page if not logged in
    }
    return NextResponse.redirect(new URL('/login', request.url)); // Redirect to login for protected routes
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userRole = decodedToken.role as string; // Assuming role is stored in custom claims

    if (isAuthPage) {
      // If logged in and trying to access auth pages, redirect to respective dashboard
      return NextResponse.redirect(new URL(userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', request.url));
    }
    
    if (pathname === '/') {
      // If logged in and on landing page, redirect to respective dashboard
       return NextResponse.redirect(new URL(userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', request.url));
    }

    if (isStudentPage && userRole !== 'student') {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url)); // Teacher trying to access student page
    }

    if (isTeacherPage && userRole !== 'teacher') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url)); // Student trying to access teacher page
    }

    return NextResponse.next(); // User is authenticated and has correct role
  } catch (error) {
    // Session cookie is invalid or expired
    console.error('Middleware Auth Error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('__session'); // Clear invalid cookie
    if (isAuthPage || pathname === '/') {
        return NextResponse.next(); // Allow access to auth pages and landing if cookie verification fails (e.g. expired)
    }
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     * - api (Genkit flows)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
};
