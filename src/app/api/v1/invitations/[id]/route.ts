import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	if (isEmpty(id)) {
		return errorResponse({}, 'Invitation ID is required', 400);
	}

	const invitation = await prisma.invite.findUnique({
		where: {
			id: id,
		},
	});

	if (isEmpty(invitation)) {
		return errorResponse({}, 'No invitation found', 404);
	}

	return successResponse(
		{
			invitation,
			metadata: {},
		},
		'Fetched invitation successfully'
	);
}

export async function DELETE(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	if (isEmpty(id)) {
		return errorResponse({}, 'Invitation ID is required', 400);
	}

	const invitationExist = await prisma.invite.findUnique({
		where: {
			id: id,
		},
	});

	if (isEmpty(invitationExist)) {
		return errorResponse({}, 'No invitation found', 404);
	}

	const invitation = await prisma.invite.delete({
		where: {
			id: id,
		},
	});

	if (isEmpty(invitation)) {
		return errorResponse({}, 'failed to  invitation', 404);
	}

	return successResponse(
		{
			invitation,
			metadata: {},
		},
		'Deleted invitation successfully'
	);
}
