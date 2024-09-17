'use client';

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { getSession, signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SigninSchema, SigninSchemaInitialValues, SigninSchemaType } from '@/types/UsersSchema';

export default function SignIn() {
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	if (session) {
		const role = session.user?.role?.toLowerCase();
		if (role === 'admin' || role === 'super_admin') {
			router.push('/admins/chats');
		} else {
			router.push('/users/chat');
		}
	}

	const handleSubmit = async (
		values: SigninSchemaType,
		{ setSubmitting, resetForm }: FormikHelpers<SigninSchemaType>
	): Promise<void> => {
		setIsLoading(true);
		try {
			const result = await signIn('credentials', {
				redirect: false,
				email: values.email,
				password: values.password,
			});

			if (result?.error) {
				toast.error(result.error);
			} else {
				const session = await getSession();
				resetForm();
				toast.success('Signed in successfully!');
				if (session) {
					const role = session.user?.role?.toLowerCase();
					if (role === 'admin' || role === 'super_admin') {
						router.push('/admins/chats');
					} else {
						router.push('/users/chat');
					}
				}
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
			setSubmitting(false);
		}
	};

	return (
		<>
			<Card className="mx-auto max-w-md">
				<CardHeader>
					<CardTitle className="text-xl">Sign In</CardTitle>
					<CardDescription>Enter your email and password to sign in</CardDescription>
				</CardHeader>

				<CardContent>
					<Formik
						initialValues={SigninSchemaInitialValues}
						validationSchema={SigninSchema}
						validateOnBlur={true}
						validateOnChange={false}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting }) => (
							<Form role="form" aria-labelledby="signin-form-title">
								<fieldset className="grid gap-4" disabled={isSubmitting || isLoading}>
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
										{isLoading ? 'Signing in...' : 'Sign In'}
									</Button>
								</fieldset>
							</Form>
						)}
					</Formik>
					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{' '}
						<Link href="/signup" className="underline">
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</>
	);
}
