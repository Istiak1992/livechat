import prisma from '@/lib/prisma';
import { errorResponse } from '@/utils/format-error-response';
import { successResponse } from '@/utils/format-success-response';
import isEmpty from 'lodash.isempty';

/*
	GET /api/v1/companies?limit=10&page=1
*/
export async function GET() {
	const company = await prisma.company.findMany({});

	if (isEmpty(company)) {
		return errorResponse([], 'No company found', 200);
	}

	return successResponse(
		{
			company,
			metadata: {
				total: company.length,
				limit: 10,
				page: 1,
				totalPages: Math.ceil(company.length / 10),
			},
		},
		'Fetched companies successfully'
	);
}
