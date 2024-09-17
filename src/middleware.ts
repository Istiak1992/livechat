import { Role } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const publicFileExtensions = [
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.css',
	'.js',
	'.ico',
	'.svg',
	'.woff',
	'.woff2',
	'.ttf',
	'.eot',
];

const protectedRoutes = [
	'/users/chat',
	'/admins/chats',
	'/admins/invitations',
	'/profile',
	'/admins/organization',
];
const publicRoutes = ['/', '/signup', '/admins/signup'];

export default async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const { pathname } = req.nextUrl;
	const role = token?.role as string;

	// Ignore requests for public assets
	if (publicFileExtensions.some((ext) => pathname.endsWith(ext))) {
		return NextResponse.next();
	}

	// If the user is authenticated and tries to visit an unauthenticated route, redirect them to the dashboard
	if (token && publicRoutes.includes(pathname)) {
		if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
			return NextResponse.redirect(new URL('/admins/chats', req.url));
		}
		if (role === Role.USER) {
			return NextResponse.redirect(new URL('/users/chat', req.url));
		}
	}

	// If the user is not authenticated and tries to visit an authenticated route, redirect them to the login page
	if (!token && protectedRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL('/', req.url));
	}

	// If the user is authenticated and tries to visit a route that doesn't match their role, redirect them to the appropriate dashboard
	if (token) {
		if (role === Role.USER && pathname.startsWith('/admins')) {
			return NextResponse.redirect(new URL('/users/chat', req.url));
		}

		if ((role === Role.ADMIN || role === Role.SUPER_ADMIN) && pathname.startsWith('/users')) {
			return NextResponse.redirect(new URL('/admins/chats', req.url));
		}
	}

	// Continue with the request
	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
		...protectedRoutes,
		...publicRoutes,
	],
};
