export const errorResponse = (data: object | [], message: string, status: number) => {
	return new Response(
		JSON.stringify({
			status,
			success: false,
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
