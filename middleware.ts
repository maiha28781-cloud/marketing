import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Executive View Protection - Handle BEFORE Supabase auth
    if (request.nextUrl.pathname.startsWith('/executive-view')) {
        // Allow public access to login page
        if (request.nextUrl.pathname === '/executive-view/login') {
            return NextResponse.next()
        }

        const executiveSession = request.cookies.get('executive_session')
        if (!executiveSession) {
            const url = request.nextUrl.clone()
            url.pathname = '/executive-view/login'
            return NextResponse.redirect(url)
        }

        // Executive session is valid, allow access without Supabase auth
        return NextResponse.next()
    }

    // For all other routes, use Supabase auth
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
