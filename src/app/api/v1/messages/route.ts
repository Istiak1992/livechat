import isEmpty from 'lodash.isempty';

import prisma from '@/lib/prisma';
import { successResponse } from '@/utils/format-success-response';

export async function GET() {
	const notifications = await prisma.message.findMany({});

	if (isEmpty(notifications)) {
		return successResponse([], 'No notifications found');
	}

	return successResponse(
		{
			notifications,
			metadata: {
				total: notifications.length,
				page: 1,
				limit: 10,
			},
		},
		'Notifications fetched successfully'
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
