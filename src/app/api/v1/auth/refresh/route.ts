import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import config from '@/config';
import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import isEmpty from 'lodash.isempty';

interface CustomJwtPayload extends JwtPayload {
	id: string;
	role: string;
}

export async function POST(request: NextRequest) {
	const body = await request.json();

	let refreshToken = null;

	if (body.refresh_token) {
		refreshToken = body.refresh_token;
	} else {
		const cookies = request.cookies;
		refreshToken = cookies.get('refresh_token')?.value;
	}

	if (isEmpty(refreshToken)) {
		return errorResponse({}, 'Invalid Refresh Token', 403);
	}

	let verifiedToken: CustomJwtPayload | null = null;

	if (refreshToken) {
		verifiedToken = jwt.verify(
			refreshToken,
			config.jwt.refresh_secret as Secret
		) as unknown as CustomJwtPayload;
	}

	if (isEmpty(verifiedToken)) {
		return errorResponse({}, 'Invalid Refresh Token', 403);
	}

	const { id } = verifiedToken;

	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			role: true,
		},
	});

	if (isEmpty(user)) {
		return errorResponse({}, 'User does not exist', 404);
	}

	const { id: user_id, role } = user;

	const access_token = jwt.sign({ id: user_id, role }, config.jwt.secret as Secret, {
		expiresIn: config.jwt.expires_in,
	});

	const refresh_token = jwt.sign({ id: user_id, role }, config.jwt.refresh_secret as Secret, {
		expiresIn: config.jwt.refresh_expires_in,
	});

	const response = NextResponse.json(
		{
			status: 200,
			success: true,
			message: 'Sign in successful',
			data: {
				role,
				access_token,
				refresh_token,
			},
		},
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		}
	);

	response.cookies.set('refresh_token', refresh_token, {
		httpOnly: true,
	});

	return response;
}
