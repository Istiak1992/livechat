import * as Yup from 'yup';

// define the SignupSchema initialValues
export type SignupSchemaType = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone?: string;
};

export type ProfileUpdateSchemaType = {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
};

// define the SignupSchema initial values
export const SignupSchemaInitialValues: SignupSchemaType = {
	first_name: '',
	last_name: '',
	email: '',
	password: '',
	phone: '',
};

// define the SignupSchema validation
export const SignupSchema = Yup.object().shape({
	first_name: Yup.string()
		.required('First name is required')
		.min(2, 'First name must be at least 2 characters')
		.max(50, 'First name must be at most 50 characters'),
	last_name: Yup.string()
		.required('Last name is required')
		.min(2, 'Last name must be at least 2 characters')
		.max(50, 'Last name must be at most 50 characters'),
	email: Yup.string().required('Email is required').email('Invalid email address'),
	phone: Yup.string()
		.matches(/^[0-9]+$/, 'Phone number must be a valid number')
		.optional(),
	role: Yup.string().optional(),
	password: Yup.string()
		.required('Password is required')
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
			'Password must be at least 8 characters long and include at least one letter, one number, and one special character'
		),
});

export const ProfileUpdateSchema = Yup.object().shape({
	first_name: Yup.string()
		.required('First name is required')
		.min(2, 'First name must be at least 2 characters')
		.max(50, 'First name must be at most 50 characters')
		.optional(),
	last_name: Yup.string()
		.required('Last name is required')
		.min(2, 'Last name must be at least 2 characters')
		.max(50, 'Last name must be at most 50 characters')
		.optional(),
	email: Yup.string().required('Email is required').email('Invalid email address').optional(),
	phone: Yup.string()
		.matches(/^[0-9]+$/, 'Phone number must be a valid number')
		.optional(),
});

// define the SigninSchema initialValues
export type SigninSchemaType = {
	email: string;
	password: string;
};

// define the SigninSchema initial values
export const SigninSchemaInitialValues: SigninSchemaType = {
	email: '',
	password: '',
};

// define the SigninSchema validation
export const SigninSchema = Yup.object().shape({
	email: Yup.string().required('Email is required').email('Invalid email address'),
	password: Yup.string()
		.required('Password is required')
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
			'Password must be at least 8 characters long and include at least one letter, one number, and one special character'
		),
});
