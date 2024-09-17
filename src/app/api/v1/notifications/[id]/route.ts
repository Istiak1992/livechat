import { NextRequest } from 'next/server';
import isEmpty from 'lodash.isempty';

import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
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

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.pathname.split('/').pop();
	const role = url.searchParams.get('role');

	if (isEmpty(id)) {
		return errorResponse({}, 'Notification id is required', 400);
	}

	if (isEmpty(role)) {
		return errorResponse({}, 'User role is required', 400);
	}

	let notifications: Notification[] = [];

	if (role === Role.USER) {
		notifications = await prisma.notification.findMany({
			where: {
				user_id: id,
				read: false,
			},
			include: {
				company: true,
			},
		});
	}

	if (role === Role.SUPER_ADMIN || role === Role.ADMIN) {
		notifications = await prisma.notification.findMany({
			where: {
				company_id: id,
				read: false,
			},
			include: {
				user: true,
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

export async function PUT(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.pathname.split('/').pop();
	const role = url.searchParams.get('role');

	if (isEmpty(id)) {
		return errorResponse({}, 'Notification id is required', 400);
	}

	if (isEmpty(role)) {
		return errorResponse({}, 'User role is required', 400);
	}

	const notifications: Notification[] = [];

	if (role === Role.USER) {
		await prisma.notification.updateMany({
			where: {
				user_id: id,
				read: false,
			},
			data: {
				read: true,
			},
		});
	}

	if (role === Role.SUPER_ADMIN || role === Role.ADMIN) {
		await prisma.notification.updateMany({
			where: {
				company_id: id,
				read: false,
			},
			data: {
				read: true,
			},
		});
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
		'All Notifications marked as read successfully'
	);
}
