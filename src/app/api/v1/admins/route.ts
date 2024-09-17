import { Role } from '@prisma/client';
import { genSalt, hash } from 'bcryptjs';
import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';
import * as Yup from 'yup';

import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import { formatValidationError } from '@/utils/format-validation-error';
import { COMPANY_AVATAR_SIZE, USER_AVATAR_STYLE } from '@/config/constants';

/* 
	GET /api/v1/users?limit=10&page=1
*/
// export async function GET() {
// 	const users = await prisma.user.findMany({
// 		select: {
// 			id: true,
// 			email: true,
// 			first_name: true,
// 			last_name: true,
// 			phone: true,
// 			role: true,
// 			created_at: true,
// 			updated_at: true,
// 		},
// 	});

// 	if (isEmpty(users)) {
// 		return errorResponse([], 'No users found', 200);
// 	}

// 	return successResponse(
// 		{
// 			users,
// 			metadata: {
// 				total: users.length,
// 				page: 1,
// 				limit: 10,
// 			},
// 		},
// 		'Fetched users successfully'
// 	);
// }

/*
	POST /api/v1/admins
	JSON Body: {
		first_name: string,
		last_name: string,
		email: string,
		phone: string,
		role: string,
		password: string
    name: string,
    website: string,
    address: string,
    description: string
	}
 */

const createAdminSchema = Yup.object().shape({
	first_name: Yup.string()
		.required('First name is required')
		.min(3, 'First name must be at least 3 characters')
		.max(50, 'First name must be at most 50 characters'),
	last_name: Yup.string()
		.required('Last name is required')
		.min(3, 'Last name must be at least 3 characters')
		.max(50, 'Last name must be at most 50 characters'),
	email: Yup.string().required('Email is required').email('Invalid email address'),
	phone: Yup.string()
		.matches(/^[0-9]+$/, 'Phone number must be a valid number')
		.optional(),
	password: Yup.string()
		.required('Password is required')
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
			'Password must be at least 8 characters long and include at least one letter, one number, and one special character'
		),
	company_name: Yup.string()
		.required('Company name is required')
		.min(3, 'Company name must be at least 3 characters')
		.max(50, 'Company name must be at most 50 characters'),
	address: Yup.string().optional(),
	description: Yup.string().optional(),
	website: Yup.string().url('Invalid website URL format').optional(),
});

export async function POST(request: NextRequest) {
	const body = await request.json();

	try {
		await createAdminSchema.validate(body, {
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
		return errorResponse({}, 'User with email already exists', 409);
	}

	const slug = body.company_name.toLowerCase().replace(/\s/g, '-');
	const companyFirstName = body.company_name.split(' ')[0];

	const existingCompany = await prisma.company.findFirst({
		where: {
			slug: slug,
		},
	});

	if (existingCompany) {
		return errorResponse({}, 'Company with this name already exists', 400);
	}

	const company = await prisma.company.create({
		data: {
			name: body.company_name,
			slug: slug,
			email: body.email,
			phone: body.phone,
			address: body.address,
			description: body.description,
			website: body.website,
			image: `https://api.dicebear.com/9.x/${COMPANY_AVATAR_SIZE}/svg?seed=${companyFirstName}&backgroundType=gradientLinear,solid&radius=50&size=48`,
		},
	});

	if (isEmpty(company)) {
		return errorResponse({}, 'Failed to create company', 400);
	}

	const salt = await genSalt(11);
	const hashedPassword = await hash(body.password, salt);

	const user = await prisma.user.create({
		data: {
			first_name: body.first_name,
			last_name: body.last_name,
			name: `${body.first_name} ${body.last_name}`,
			email: body.email,
			phone: body.phone,
			role: Role.SUPER_ADMIN,
			password: hashedPassword,
			company_id: company.id,
			image: `https://api.dicebear.com/9.x/${USER_AVATAR_STYLE}/svg?seed=${body.first_name}&backgroundType=gradientLinear,solid&radius=50&size=48`,
		},
		select: {
			id: true,
			name: true,
			email: true,
			first_name: true,
			last_name: true,
			image: true,
			phone: true,
			role: true,
			company: {
				select: {
					id: true,
					name: true,
					slug: true,
					image: true,
					email: true,
					phone: true,
					address: true,
					description: true,
					website: true,
					created_at: true,
					updated_at: true,
				},
			},
			created_at: true,
			updated_at: true,
		},
	});

	if (isEmpty(user)) {
		return errorResponse({}, 'Failed to create user', 200);
	}

	return successResponse(
		{
			user,
			metadata: {},
		},
		'User created successfully',
		201
	);
}
