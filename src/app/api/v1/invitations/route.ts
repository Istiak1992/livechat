import config from '@/config';
import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import { formatValidationError } from '@/utils/format-validation-error';
import { Role } from '@prisma/client';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';
import * as Yup from 'yup';

const createInvitation = Yup.object().shape({
	email: Yup.string().required('Email is required').email('Invalid email address'),
});

export async function POST(request: NextRequest) {
	const authorizationHeader = request.headers.get('Authorization')?.split(' ')[1];
	const body = await request.json();

	try {
		await createInvitation.validate(body, {
			strict: true,
			abortEarly: false,
		});
	} catch (error) {
		return formatValidationError(error);
	}

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
			company_id: true,
			role: true,
		},
	});

	if (isEmpty(isUserExist)) {
		throw errorResponse({}, 'User does not exist', 404);
	}

	if (!isUserExist.company_id) {
		return errorResponse({}, 'You cannot create invites without a company ID', 403);
	}

	if (isUserExist.role !== Role.SUPER_ADMIN && isUserExist.role !== Role.ADMIN) {
		return errorResponse({}, 'You are not authorized to create invites', 403);
	}

	const invitation = await prisma.invite.create({
		data: {
			email: body.email,
			role: Role.ADMIN,
			company_id: isUserExist.company_id,
		},
		select: {
			id: true,
			email: true,
			role: true,
			company_id: true,
			company: true,
			created_at: true,
			updated_at: true,
			is_deleted: true,
		},
	});

	return successResponse(
		{
			invitation,
			metadata: {},
		},
		'invitation created successfully',
		201
	);
}

export async function GET(request: NextRequest) {
	const authorizationHeader = request.headers.get('Authorization')?.split(' ')[1];

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
			company_id: true,
			role: true,
		},
	});

	if (isEmpty(isUserExist)) {
		throw errorResponse({}, 'User does not exist', 404);
	}

	if (!isUserExist.company_id) {
		return errorResponse({}, 'You cannot create invites without a company ID', 403);
	}

	if (isUserExist.role !== Role.SUPER_ADMIN && isUserExist.role !== Role.ADMIN) {
		return errorResponse({}, 'You are not authorized to create invites', 403);
	}

	const invitations = await prisma.invite.findMany({
		where: {
			company_id: isUserExist.company_id,
		},
	});

	if (isEmpty(invitations)) {
		return errorResponse([], 'No invitations found', 200);
	}

	return successResponse(
		{
			invitations,
			metadata: {
				total: invitations.length,
			},
		},
		'Fetched invitations successfully'
	);
}
