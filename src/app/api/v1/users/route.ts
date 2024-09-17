import { InviteStatus, Role } from '@prisma/client';
import { genSalt, hash } from 'bcryptjs';
import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import { formatValidationError } from '@/utils/format-validation-error';
import { SignupSchema } from '@/types/UsersSchema';
import { USER_AVATAR_STYLE } from '@/config/constants';

/* 
	GET /api/v1/users?limit=10&page=1
*/
export async function GET() {
	const users = await prisma.user.findMany({
		where: {
			role: Role.USER,
		},
		select: {
			id: true,
			email: true,
			first_name: true,
			last_name: true,
			phone: true,
			role: true,
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(users)) {
		return errorResponse([], 'No users found', 200);
	}

	return successResponse(
		{
			users,
			metadata: {
				total: users.length,
				page: 1,
				limit: 10,
			},
		},
		'Fetched users successfully'
	);
}

/*
	POST /api/v1/users
	JSON Body: {
		first_name: string,
		last_name: string,
		email: string,
		phone: string,
		role: string,
		password: string
	}
 */
export async function POST(request: NextRequest) {
	const body = await request.json();

	try {
		await SignupSchema.validate(body, {
			strict: true,
			abortEarly: false,
		});
	} catch (error) {
		return formatValidationError(error);
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			email: body.email,
		},
	});

	if (existingUser) {
		return errorResponse({}, 'User with this email already exists', 409);
	}

	const salt = await genSalt(11);
	const hashedPassword = await hash(body.password, salt);

	const name = `${body.first_name} ${body.last_name}`;

	let newUser: {
		first_name: string;
		last_name: string;
		name: string;
		email: string;
		phone: string;
		role: Role;
		password: string;
		image: string;
		company_id?: string;
	} = {
		first_name: body.first_name,
		last_name: body.last_name,
		name,
		email: body.email,
		phone: body.phone,
		role: body.role || Role.USER,
		password: hashedPassword,
		image: `https://api.dicebear.com/9.x/${USER_AVATAR_STYLE}/svg?seed=${body.first_name}&backgroundType=gradientLinear,solid&radius=50&size=48`,
	};

	const invitationExist = await prisma.invite.findUnique({
		where: {
			email: body.email,
		},
		select: {
			email: true,
			role: true,
			company_id: true,
		},
	});

	if (!isEmpty(invitationExist)) {
		newUser = {
			...newUser,
			role: invitationExist.role ?? Role.ADMIN,
			company_id: invitationExist.company_id,
		};
	}
	try {
		const result = await prisma.$transaction(async (prisma) => {
			const user = await prisma.user.create({
				data: newUser,
				select: {
					id: true,
					email: true,
					first_name: true,
					last_name: true,
					name: true,
					image: true,
					phone: true,
					role: true,
					company_id: true,
					created_at: true,
					updated_at: true,
				},
			});

			if (invitationExist) {
				await prisma.invite.update({
					where: { email: invitationExist.email },
					data: { status: InviteStatus.ACCEPTED },
				});
			}

			return user;
		});

		return successResponse(
			{
				result,
				metadata: {},
			},
			'User created successfully',
			201
		);
	} catch (error) {
		return errorResponse({}, 'Failed to create user or update invitation', 500);
	}
}
