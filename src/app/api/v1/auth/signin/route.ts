import { compare } from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import isEmpty from 'lodash.isempty';

import config from '@/config';
import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { formatValidationError } from '@/utils/format-validation-error';
import { SigninSchema } from '@/types/UsersSchema';

export async function POST(request: NextRequest) {
	const body = await request.json();

	try {
		await SigninSchema.validate(body, {
			strict: true,
			abortEarly: false,
		});
	} catch (error) {
		return formatValidationError(error);
	}

	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
		},
		select: {
			id: true,
			role: true,
			password: true,
		},
	});

	if (isEmpty(user)) {
		return errorResponse({}, 'User does not exist', 404);
	}

	const isPasswordMatch = await compare(body.password, user.password);

	if (!isPasswordMatch) {
		return errorResponse({}, 'Password is incorrect', 401);
	}

	const { id, role } = user;

	const access_token = jwt.sign({ id, role }, config.jwt.secret as Secret, {
		expiresIn: config.jwt.expires_in,
	});

	const refresh_token = jwt.sign({ id, role }, config.jwt.refresh_secret as Secret, {
		expiresIn: config.jwt.refresh_expires_in,
	});

	// return successResponse(
	// 	{
	// 		role,
	// 		access_token,
	// 		refresh_token,
	// 	},
	// 	'Sign in successful'
	// );

	const response = NextResponse.json(
		{
			status: 200,
			success: true,
			message: 'Sign in successful',
			data: {
				id,
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

	response.cookies.set('access_token', access_token, {
		httpOnly: true,
	});

	response.cookies.set('refresh_token', refresh_token, {
		httpOnly: true,
	});

	return response;
}
