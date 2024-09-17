import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InviteSchema, InviteSchemaInitialValues, InviteSchemaType } from '@/types/InviteSchema';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import toast from 'react-hot-toast';

const InvitationForm = () => {
	const { data: sessionData } = useSession();
	const token = sessionData?.user?.accessToken as string | undefined;

	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (
		values: InviteSchemaType,
		{ setSubmitting, resetForm }: FormikHelpers<InviteSchemaType>
	): Promise<void> => {
		setIsLoading(true);
		try {
			const response = await axios.post('/api/v1/invitations', values, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.status === 201) {
				toast.success('Invited successfully!');
				resetForm();
				router.refresh();
			} else {
				console.error('Unexpected response status:', response.status);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Axios error:', error.response?.data);
				toast.error(
					(error.response?.data?.message as string) || 'Failed to invite. Please try again.'
				);
			} else {
				console.error('Unexpected error:', error);
				toast.error('An unexpected error occurred. Please try again.');
			}
		} finally {
			setIsLoading(false);
			setSubmitting(false);
		}
	};
	return (
		<Formik
			initialValues={InviteSchemaInitialValues}
			validationSchema={InviteSchema}
			validateOnBlur={true}
			validateOnChange={false}
			onSubmit={handleSubmit}
		>
			{({ isSubmitting }) => (
				<Form role="form" aria-labelledby="invite-form-title">
					<div className="flex gap-2 items-center">
						<Field
							id="email"
							name="email"
							type="email"
							placeholder="Email"
							as={Input}
							aria-required="true"
						/>

						<Button type="submit" disabled={isSubmitting || isLoading} aria-busy={isLoading}>
							{isLoading ? 'Inviting...' : 'Invite'}
						</Button>
					</div>
					<ErrorMessage
						name="email"
						component="div"
						className="text-red-500 text-sm"
						aria-live="assertive"
					/>
				</Form>
			)}
		</Formik>
	);
};

export default InvitationForm;
