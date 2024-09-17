import { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
	const response_data = JSON.stringify({
		message: 'OK',
	});

	const options = {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
		},
	};

	return new Response(response_data, options);
}
