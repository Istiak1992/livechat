import * as Yup from 'yup';

export type InviteSchemaType = {
	email: string;
};

export const InviteSchemaInitialValues: InviteSchemaType = {
	email: '',
};

export const InviteSchema = Yup.object().shape({
	email: Yup.string().required('Email is required').email('Invalid email address'),
});
