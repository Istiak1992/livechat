import * as Yup from 'yup';

import { errorResponse } from './format-error-response';

export const formatValidationError = (error: unknown) => {
	const status = 400;
	const message = 'Validation failed';

	if (error instanceof Yup.ValidationError) {
		const validationErrors = error.inner.map((err) => ({
			path: err.path,
			message: err.message,
		}));

		return errorResponse(validationErrors, message, status);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return errorResponse(error as any, message, status);
};
