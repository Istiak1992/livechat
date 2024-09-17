import config from '@/config';
import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import { formatValidationError } from '@/utils/format-validation-error';
import { Company, Role } from '@prisma/client';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import isEmpty from 'lodash.isempty';
import { NextRequest } from 'next/server';
import * as Yup from 'yup';

/* 
	GET /api/v1/companies/:id
*/
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	if (isEmpty(id)) {
		return errorResponse({}, 'Company ID is required', 400);
	}

	const company = await prisma.company.findUnique({
		where: {
			id: id,
		},
	});

	if (isEmpty(company)) {
		return errorResponse({}, 'No Company found', 404);
	}

	return successResponse(
		{
			company,
			metadata: {},
		},
		'Fetched company successfully'
	);
}

const updateCompanySchema = Yup.object().shape({
	name: Yup.string()
		.required('Company name is required')
		.min(3, 'Company name must be at least 3 characters')
		.max(50, 'Company name must be at most 50 characters')
		.optional(),
	email: Yup.string().required('Email is required').email('Invalid email address').optional(),
	phone: Yup.string()
		.matches(/^[0-9]+$/, 'Phone number must be a valid number')
		.optional(),
	address: Yup.string().optional(),
	description: Yup.string().optional(),
	website: Yup.string().url('Invalid website URL format').optional(),
});

export async function PUT(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id') as string;

	const authorizationHeader = request.headers.get('Authorization')?.split(' ')[1];

	if (!authorizationHeader) {
		return errorResponse({}, 'You are not authorized', 401);
	}

	if (isEmpty(id)) {
		return errorResponse({}, 'Company ID is required', 400);
	}

	let verifiedToken: JwtPayload;

	try {
		verifiedToken = jwt.verify(authorizationHeader, config.jwt.secret as Secret) as JwtPayload;
	} catch (error) {
		return errorResponse({}, 'Invalid or expired token', 401);
	}

	const user = await prisma.user.findUnique({
		where: { id: verifiedToken?.id },
		select: {
			company_id: true,
			role: true,
		},
	});

	if (isEmpty(user)) {
		throw errorResponse({}, 'User does not exist', 404);
	}

	if (user.company_id !== id && user.role !== Role.SUPER_ADMIN) {
		return errorResponse({}, 'You are not authorized to update this company', 403);
	}

	const body = await request.json();

	try {
		await updateCompanySchema.validate(body, {
			strict: true,
			abortEarly: false,
		});
	} catch (error) {
		return formatValidationError(error);
	}

	const company = await prisma.company.findUnique({
		where: {
			id: id,
		},
	});

	if (isEmpty(company)) {
		return errorResponse({}, 'No Company found', 404);
	}

	const allowedFields = ['name', 'email', 'phone', 'address', 'description', 'website'];

	const filteredPayload: Partial<Company> = Object.keys(body)
		.filter((key) => allowedFields.includes(key as keyof Company))
		.reduce((obj, key) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(obj as any)[key] = (body as any)[key];
			return obj;
		}, {} as Partial<Company>);

	const updateCompany = await prisma.company.update({
		where: {
			id: id,
		},
		data: filteredPayload,
	});

	if (isEmpty(updateCompany)) {
		return errorResponse({}, 'Failed to update company data', 404);
	}

	return successResponse(
		{
			user: updateCompany,
			metadata: {},
		},
		'Updated company successfully'
	);
}
