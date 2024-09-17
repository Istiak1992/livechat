import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';
import * as Yup from 'yup';

import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import { formatValidationError } from '@/utils/format-validation-error';

/* 
	GET /api/v1/users/:id
*/
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	if (isEmpty(id)) {
		return errorResponse({}, 'User ID is required', 400);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: id,
		},
		select: {
			id: true,
			first_name: true,
			last_name: true,
			name: true,
			email: true,
			phone: true,
			image: true,
			role: true,
			company_id: true,
			company: true,
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(user)) {
		return errorResponse({}, 'No user found', 404);
	}

	return successResponse(
		{
			user,
			metadata: {},
		},
		'Fetched user successfully'
	);
}

/* 
	DELETE /api/v1/users/:id
*/
export async function DELETE(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	if (isEmpty(id)) {
		return errorResponse({}, 'User ID is required', 400);
	}

	const userExist = await prisma.user.findUnique({
		where: {
			id: id,
		},
		select: {
			id: true,
			first_name: true,
			last_name: true,
			name: true,
			email: true,
			phone: true,
			image: true,
			role: true,
			company_id: true,
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(userExist)) {
		return errorResponse({}, 'No user found', 404);
	}

	const user = await prisma.user.delete({
		where: {
			id: id,
		},
		select: {
			id: true,
			first_name: true,
			last_name: true,
			name: true,
			email: true,
			phone: true,
			image: true,
			role: true,
			company_id: true,
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(user)) {
		return errorResponse({}, 'No user found', 404);
	}

	return successResponse(
		{
			user,
			metadata: {},
		},
		'Deleted user successfully'
	);
}

/* 
	PUT /api/v1/users/:id
  JSON Body: {
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    role: string,
  }
*/
const updateUserSchema = Yup.object().shape({
	first_name: Yup.string()
		.optional()
		.min(3, 'First name must be at least 3 characters')
		.max(50, 'First name must be at most 50 characters'),
	last_name: Yup.string()
		.optional()
		.min(3, 'Last name must be at least 3 characters')
		.max(50, 'Last name must be at most 50 characters'),
	email: Yup.string().optional(),
	phone: Yup.string()
		.matches(/^[0-9]+$/, 'Phone number must be a valid number')
		.optional(),
	role: Yup.string().optional(),
	password: Yup.string()
		.optional()
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
			'Password must be at least 8 characters long and include at least one letter, one number, and one special character'
		),
});

export async function PUT(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	if (isEmpty(id)) {
		return errorResponse({}, 'User ID is required', 400);
	}

	const body = await request.json();

	try {
		await updateUserSchema.validate(body, {
			strict: true,
			abortEarly: false,
		});
	} catch (error) {
		return formatValidationError(error);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: id,
		},
		select: {
			id: true,
			email: true,
			first_name: true,
			last_name: true,
			name: true,
			image: true,
			phone: true,
			role: true,
			created_at: true,
			updated_at: true,
		},
	});

	const updateUser = await prisma.user.update({
		where: {
			id: id,
		},
		data: {
			first_name: body.first_name || user?.first_name,
			last_name: body.last_name || user?.last_name,
			name: `${body.first_name || user?.first_name} ${body.last_name || user?.last_name}`,
			email: body.email || user?.email,
			phone: body.phone || user?.phone,
			role: body.role || user?.role,
			updated_at: new Date().toISOString(),
		},
		select: {
			id: true,
			email: true,
			first_name: true,
			last_name: true,
			name: true,
			image: true,
			phone: true,
			role: true,
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(updateUser)) {
		return errorResponse({}, 'Failed to update user data', 404);
	}

	return successResponse(
		{
			user: updateUser,
			metadata: {},
		},
		'Updated user successfully'
	);
}
