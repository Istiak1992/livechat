import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';
import { successResponse } from '@/utils/format-success-response';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import config from '@/config';
import { errorResponse } from '@/utils/format-error-response';

type Notification = {
	id: string;
	title: string;
	read: boolean;
	link: string;
	user_id: string | null;
	company_id: string | null;
	created_at: Date;
	updated_at: Date;
	is_deleted: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
	const authorizationHeader = request.headers.get('Authorization')?.split(' ')[1];

	if (!authorizationHeader) {
		throw new Error('Authorization token is missing');
	}

	let verifiedToken: JwtPayload;

	try {
		verifiedToken = jwt.verify(authorizationHeader, config.jwt.secret as Secret) as JwtPayload;
	} catch (error) {
		return errorResponse({}, 'Invalid or expired token', 401);
	}

	const userId = verifiedToken.id as string;
	const userRole = verifiedToken.role as string;

	let notifications: Notification[] = [];

	if (userRole === Role.USER) {
		notifications = await prisma.notification.findMany({
			where: {
				user_id: userId,
				read: false,
			},
		});
	}

	if (userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN) {
		notifications = await prisma.notification.findMany({
			where: {
				company_id: userId,
				read: false,
			},
		});
	}

	if (isEmpty(notifications)) {
		return successResponse([], 'No notifications found');
	}

	return successResponse(
		{
			notifications,
			metadata: {
				total: notifications.length,
				page: 1,
				limit: 20,
			},
		},
		'Notifications fetched successfully'
	);
}
