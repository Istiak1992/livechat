import * as Yup from 'yup';

// define the SignupSchema initialValues
export type CompanySignupSchemaType = {
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	password: string;
	company_name: string;
	address?: string;
	description?: string;
	website?: string;
};

// define the SignupSchema initial values
export const companySignupSchemaInitialValues: CompanySignupSchemaType = {
	first_name: '',
	last_name: '',
	email: '',
	phone: '',
	password: '',
	company_name: '',
	address: '',
	description: '',
	website: '',
};

// define the SignupSchema validation
export const companySignupSchema = Yup.object().shape({
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

export const companyUpdateSchema = Yup.object().shape({
	email: Yup.string().required('Email is required').email('Invalid email address'),
	phone: Yup.string()
		.matches(/^[0-9]+$/, 'Phone number must be a valid number')
		.optional(),
	company_name: Yup.string()
		.required('Company name is required')
		.min(3, 'Company name must be at least 3 characters')
		.max(50, 'Company name must be at most 50 characters'),
	address: Yup.string().optional(),
	description: Yup.string().optional(),
	website: Yup.string().url('Invalid website URL format').optional(),
});
