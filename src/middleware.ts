import { type NextRequest, NextResponse } from 'next/server';

// DO NOT import `auth` from `firebase-admin` here, as it's not Edge-compatible.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isStudentPage = pathname.startsWith('/student');
  const isTeacherPage = pathname.startsWith('/teacher');
  const isApiInternalAuthRoute = pathname.startsWith('/api/auth'); // Exclude internal auth API routes from some checks

  // Allow internal auth API routes to be accessed
  if (isApiInternalAuthRoute) {
    return NextResponse.next();
  }
  
  // Allow other API routes (like Genkit flows)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }


  if (!sessionCookie) {
    if (isAuthPage || pathname === '/') {
      return NextResponse.next(); // Allow access to auth pages and landing page if not logged in
    }
    return NextResponse.redirect(new URL('/login', request.url)); // Redirect to login for protected routes
  }

  // If session cookie exists, verify it by calling the API route
  try {
    const verifyApiUrl = new URL('/api/auth/verify-token', request.url);
    const verifyResponse = await fetch(verifyApiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass along the cookie if needed by the API route for other purposes,
        // but here we explicitly send it in the body.
      },
      body: JSON.stringify({ sessionCookie }),
    });

    if (!verifyResponse.ok) {
      // Verification failed (e.g., token invalid, expired)
      const errorData = await verifyResponse.json().catch(() => ({ error: 'Verification API error' }));
      console.error('Middleware session verification failed:', verifyResponse.status, errorData.error);
      
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('__session'); // Clear invalid cookie

      if (isAuthPage || pathname === '/') {
        // If already on an auth page or landing page, don't redirect into a loop, just clear cookie and proceed
         const nextResponse = NextResponse.next();
         nextResponse.cookies.delete('__session');
         return nextResponse;
      }
      return response;
    }

    const { role: userRole } = await verifyResponse.json();

    if (!userRole) {
        console.error('Middleware: Role not found in verified token.');
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('__session');
        if (isAuthPage || pathname === '/') {
             const nextResponse = NextResponse.next();
             nextResponse.cookies.delete('__session');
             return nextResponse;
        }
        return response;
    }


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
    // Catch-all for unexpected errors during fetch or processing
    console.error('Middleware Auth Error (catch-all):', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('__session'); // Clear potentially problematic cookie
     if (isAuthPage || pathname === '/') {
        // If already on an auth page or landing page, don't redirect into a loop
         const nextResponse = NextResponse.next();
         nextResponse.cookies.delete('__session');
         return nextResponse;
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
     * - files explicitly starting with /api/ (but we handle /api/auth/* and other /api/* specifically above)
     * 
     * The goal is to apply this middleware to pages and general navigation,
     * while specific API routes like /api/auth/verify-token are handled or bypassed correctly.
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
