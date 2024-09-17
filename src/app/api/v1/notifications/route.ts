import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';
import { successResponse } from '@/utils/format-success-response';
import jwt, { Secret } from 'jsonwebtoken';
import { Role } from '@prisma/client';

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
export async function GET(req: NextRequest) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const token: any = 'await getServerSession(authOptions)';

	if (!token) {
		throw new Error('Authorization token is missing');
	}

	const session = jwt.verify('token', process.env.JWT_SECRET as Secret);

	if (typeof session === 'string') {
		throw new Error('Invalid token');
	}

	const userId = (session as jwt.JwtPayload).id as string;
	const userRole = (session as jwt.JwtPayload).role as string;

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
