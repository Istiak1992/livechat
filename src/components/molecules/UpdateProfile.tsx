import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileUpdateSchema, ProfileUpdateSchemaType } from '@/types/UsersSchema';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const UpdateProfile = ({ profile }) => {
	const { data: sessionData } = useSession();
	const userId = sessionData?.user?.id as string | undefined;

	const [isEdit, setIsEdit] = useState(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const initialValues: ProfileUpdateSchemaType = {
		first_name: profile.first_name,
		last_name: profile.last_name,
		email: profile.email,
		phone: profile.phone,
	};

	const handleEdit = () => {
		setIsEdit(!isEdit);
	};

	const handleSubmit = async (
		values: ProfileUpdateSchemaType,
		{ setSubmitting }: FormikHelpers<ProfileUpdateSchemaType>
	): Promise<void> => {
		setIsLoading(true);
		try {
			const { first_name, last_name, phone } = values;

			const updatedData: ProfileUpdateSchemaType = {};

			if (profile?.first_name != first_name) {
				updatedData.first_name = first_name;
			}

			if (profile?.last_name != last_name) {
				updatedData.last_name = last_name;
			}

			if (profile?.phone != phone) {
				updatedData.phone = phone;
			}

			if (Object.keys(updatedData).length === 0) {
				toast.error('No changes detected.');
				setIsEdit(!isEdit);
				return;
			}

			const response = await axios.put(`/api/v1/users/${userId}`, updatedData, {});
			if (response.status === 200) {
				toast.success('Information updated successfully!');
				// resetForm();
				// Router.refresh();
			} else {
				console.error('Unexpected response status:', response.status);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Axios error:', error.response?.data);
				toast.error(
					(error.response?.data?.message as string) || 'Failed to Update. Please try again.'
				);
			} else {
				console.error('Unexpected error:', error);
				toast.error('An unexpected error occurred. Please try again.');
			}
		} finally {
			setIsLoading(false);
			setSubmitting(false);
			setIsEdit(!isEdit);
		}
	};

	return (
		<Card className="mx-auto max-w-sm">
			<div className="flex items-center justify-between">
				<CardHeader className="">
					<CardTitle className="text-xl">Profile</CardTitle>
				</CardHeader>
				<Button type="submit" className="w-fit mx-6" onClick={handleEdit}>
					{isEdit ? 'Cancel' : 'Edit'}
				</Button>
			</div>
			<CardContent>
				<Formik
					initialValues={initialValues}
					validationSchema={ProfileUpdateSchema}
					validateOnBlur={true}
					validateOnChange={false}
					onSubmit={handleSubmit}
				>
					{({ isSubmitting }) => (
						<Form role="form" aria-labelledby="signup-form-title">
							<fieldset className="grid gap-4" disabled={isSubmitting || isLoading}>
								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="first_name">First name *</Label>
										<Field
											disabled={!isEdit}
											id="first_name"
											name="first_name"
											placeholder="Max"
											as={Input}
											aria-required="true"
										/>
										<ErrorMessage
											name="first_name"
											component="div"
											className="text-red-500 text-sm"
											aria-live="assertive"
										/>
									</div>

									<div className="grid gap-2">
										<Label htmlFor="last_name">Last name *</Label>
										<Field
											disabled={!isEdit}
											id="last_name"
											name="last_name"
											placeholder="Robinson"
											as={Input}
											aria-required="true"
										/>
										<ErrorMessage
											name="last_name"
											component="div"
											className="text-red-500 text-sm"
											aria-live="assertive"
										/>
									</div>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="email">Email *</Label>
									<Field
										disabled
										id="email"
										name="email"
										type="email"
										placeholder="max@example.com"
										as={Input}
										aria-required="true"
									/>
									<ErrorMessage
										name="email"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Field
										id="phone"
										name="phone"
										type="tel"
										placeholder="123-456-7890"
										as={Input}
										disabled={!isEdit}
									/>
									<ErrorMessage
										name="phone"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>
								{isEdit && (
									<Button
										type="submit"
										className="w-full"
										disabled={isSubmitting || isLoading}
										aria-busy={isLoading}
									>
										{isLoading ? 'Submitting...' : 'Submit'}
									</Button>
								)}
							</fieldset>
						</Form>
					)}
				</Formik>
			</CardContent>
		</Card>
	);
};

export default UpdateProfile;
