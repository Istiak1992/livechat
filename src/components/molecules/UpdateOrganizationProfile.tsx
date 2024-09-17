import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompanySignupSchemaType, companyUpdateSchema } from '@/types/CompaniesSchema';
import { Role } from '@prisma/client';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const UpdateOrganizationProfile = ({ profile }) => {
	const { data: sessionData } = useSession();
	const userRole = sessionData?.user?.role as string | undefined;
	const token = sessionData?.user?.accessToken as string | undefined;

	const [isEdit, setIsEdit] = useState(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const initialValues: Partial<CompanySignupSchemaType> = {
		company_name: profile.company.name,
		email: profile.company.email,
		phone: profile.company.phone,
		address: profile.company.address,
		description: profile.company.description,
		website: profile.company.website,
	};

	const handleEdit = () => {
		setIsEdit(!isEdit);
	};

	const handleSubmit = async (
		values: Partial<CompanySignupSchemaType>,
		{ setSubmitting }: FormikHelpers<Partial<CompanySignupSchemaType>>
	): Promise<void> => {
		setIsLoading(true);
		try {
			const { email, company_name, phone, address, description, website } = values;

			const updatedData: Partial<CompanySignupSchemaType> = {};

			if (profile.company.name != company_name) {
				updatedData.company_name = company_name;
			}
			if (profile.company.email != email) {
				updatedData.email = email;
			}
			if (profile.company.phone != phone) {
				updatedData.phone = phone;
			}
			if (profile.company.address != address) {
				updatedData.address = address;
			}
			if (profile.company.description != description) {
				updatedData.description = description;
			}
			if (profile.company.website != website) {
				updatedData.website = website;
			}

			if (Object.keys(updatedData).length === 0) {
				toast.error('No changes detected.');
				setIsEdit(!isEdit);
				return;
			}

			const response = await axios.put(`/api/v1/companies/${profile.company_id}`, updatedData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
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
					<CardTitle className="text-xl">Company Information</CardTitle>
				</CardHeader>

				{!(userRole !== Role.SUPER_ADMIN) && (
					<Button type="submit" className="w-fit mx-6" onClick={handleEdit}>
						{isEdit ? 'Cancel' : 'Edit'}
					</Button>
				)}
			</div>
			<CardContent>
				<Formik
					initialValues={initialValues}
					validationSchema={companyUpdateSchema}
					validateOnBlur={true}
					validateOnChange={false}
					onSubmit={handleSubmit}
				>
					{({ isSubmitting }) => (
						<Form role="form" aria-labelledby="signup-form-title">
							<fieldset className="grid gap-4" disabled={isSubmitting || isLoading}>
								<div className="grid gap-2">
									<Label htmlFor="company_name">Company Name</Label>
									<Field
										disabled={!isEdit}
										id="company_name"
										name="company_name"
										type="text"
										placeholder="ex: xyz limited"
										as={Input}
									/>
									<ErrorMessage
										name="company_name"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
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
										disabled={!isEdit}
										id="phone"
										name="phone"
										type="tel"
										placeholder="123-456-7890"
										as={Input}
									/>
									<ErrorMessage
										name="phone"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="address">Address</Label>
									<Field
										disabled={!isEdit}
										id="address"
										name="address"
										type="text"
										placeholder="ex: shahbagh, room #702, block-c, 1000, dhaka"
										as={Input}
									/>
									<ErrorMessage
										name="address"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="description">Company description</Label>
									<Field
										disabled={!isEdit}
										id="description"
										name="description"
										type="text"
										placeholder="ex: we are software international trading company"
										as={Input}
									/>
									<ErrorMessage
										name="description"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="website">Website</Label>
									<Field
										disabled={!isEdit}
										id="website"
										name="website"
										type="url"
										placeholder="ex: https://example.com"
										as={Input}
									/>
									<ErrorMessage
										name="website"
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

export default UpdateOrganizationProfile;
