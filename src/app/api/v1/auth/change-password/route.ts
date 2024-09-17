import config from '@/config';
import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import { compare, genSalt, hash } from 'bcryptjs';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
	const authorizationHeader = request.headers.get('Authorization')?.split(' ')[1];
	const { oldPassword, newPassword } = await request.json();

	if (!authorizationHeader) {
		return errorResponse({}, 'You are not authorized', 401);
	}

	let verifiedToken: JwtPayload;

	try {
		verifiedToken = jwt.verify(authorizationHeader, config.jwt.secret as Secret) as JwtPayload;
	} catch (error) {
		return errorResponse({}, 'Invalid or expired token', 401);
	}

	const isUserExist = await prisma.user.findUnique({
		where: { id: verifiedToken?.id },
		select: {
			id: true,
			password: true,
		},
	});

	if (isEmpty(isUserExist)) {
		throw errorResponse({}, 'User does not exist', 404);
	}

	const isPasswordMatch = await compare(oldPassword, isUserExist.password);

	// if (isEmpty(isPasswordMatch)) {
	// 	throw errorResponse({}, 'Old Password is incorrect', 401);
	// }

	if (!isPasswordMatch) {
		throw errorResponse({}, 'Old Password is incorrect', 401);
	}

	const salt = await genSalt(11);
	const hashedNewPassword = await hash(newPassword, salt);

	const updatedUser = await prisma.user.update({
		where: { id: isUserExist?.id },
		data: {
			password: hashedNewPassword,
		},
	});

	if (isEmpty(updatedUser)) {
		return errorResponse({}, 'Failed to update password', 200);
	}

	return successResponse({}, 'Password changed successfully', 201);
}
