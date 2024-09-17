'use client';

import axios from 'axios';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	companySignupSchema,
	companySignupSchemaInitialValues,
	CompanySignupSchemaType,
} from '@/types/CompaniesSchema';

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (
		values: CompanySignupSchemaType,
		{ setSubmitting, resetForm }: FormikHelpers<CompanySignupSchemaType>
	): Promise<void> => {
		setIsLoading(true);
		try {
			const response = await axios.post('/api/v1/admins', values, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.status === 201) {
				toast.success('Company created successfully!');
				resetForm();
				router.push('/');
			} else {
				console.error('Unexpected response status:', response.status);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Axios error:', error.response?.data);
				toast.error(
					(error.response?.data?.message as string) || 'Failed to create company. Please try again.'
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
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-xl">Sign Up</CardTitle>
				<CardDescription>Enter information to create a company account</CardDescription>
			</CardHeader>

			<CardContent>
				<Formik
					initialValues={companySignupSchemaInitialValues}
					validationSchema={companySignupSchema}
					validateOnBlur={true}
					validateOnChange={false}
					onSubmit={handleSubmit}
				>
					{({ isSubmitting }) => (
						<Form className="" role="form" aria-labelledby="signup-form-title">
							<fieldset className="grid gap-4" disabled={isSubmitting || isLoading}>
								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="first_name">First name *</Label>
										<Field
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
									<Field id="phone" name="phone" type="tel" placeholder="123-456-7890" as={Input} />
									<ErrorMessage
										name="phone"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="company_name">Company Name *</Label>
									<Field
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
									<Label htmlFor="address">Address</Label>
									<Field
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

								<div className="grid gap-2">
									<Label htmlFor="password">Password *</Label>
									<Field
										id="password"
										name="password"
										type="password"
										as={Input}
										aria-required="true"
									/>
									<ErrorMessage
										name="password"
										component="div"
										className="text-red-500 text-sm"
										aria-live="assertive"
									/>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isSubmitting || isLoading}
									aria-busy={isLoading}
								>
									{isLoading ? 'Creating account...' : 'Create an account'}
								</Button>
							</fieldset>
						</Form>
					)}
				</Formik>

				<div className="mt-4 text-center text-sm">
					Already have an account?{' '}
					<Link href="/" className="underline">
						Sign in
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
