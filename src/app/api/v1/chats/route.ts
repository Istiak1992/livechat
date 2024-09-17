import isEmpty from 'lodash.isempty';

import prisma from '@/lib/prisma';
import { successResponse } from '@/utils/format-success-response';
import { errorResponse } from '@/utils/format-error-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const id = params.id;

	if (isEmpty(id)) {
		return errorResponse({}, 'Chat id is required', 400);
	}

	const chats = await prisma.chat.findMany({
		where: {
			company_id: id,
		},
		select: {
			id: true,
			company_id: true,
			user_id: true,
			messages: {
				select: {
					id: true,
					content: true,
					chat_id: true,
					created_at: true,
					updated_at: true,
				},
			},
			company: true,
			user: true,
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(chats)) {
		return successResponse([], 'No chats found');
	}

	return successResponse(
		{
			chats,
			metadata: {
				total: chats.length,
				page: 1,
				limit: 10,
			},
		},
		'Chats fetched successfully'
	);
}

/* 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  const notifications = await prisma.notification.findMany({
    skip,
    take: limit,
  });

  const totalNotifications = await prisma.notification.count();

  if (isEmpty(notifications)) {
    return successResponse([], 'No notifications found');
  }

  return successResponse(
    {
      notifications,
      metadata: {
        total: totalNotifications,
        page,
        limit,
      },
    },
    'Notifications fetched successfully'
  );
}
*/
