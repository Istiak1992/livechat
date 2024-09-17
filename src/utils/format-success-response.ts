// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const successResponse = (data: any, message: string, status: number = 200) => {
	return new Response(
		JSON.stringify({
			status,
			success: true,
			message,
			data,
		}),
		{
			status,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		}
	);
};
