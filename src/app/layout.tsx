import type { Metadata } from 'next';

import Header from '@/components/molecules/Header';
import AuthProvider from '@/providers/session-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { getSession } from 'next-auth/react';
import { cookies } from 'next/headers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
	title: 'Chat support',
	description: 'Chat support',
};

export const viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: 1,
};
interface RootLayoutProps {
	children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
	const session = await getSession();
	const layout = cookies().get('react-resizable-panels:layout');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

	return (
		<>
			<html lang="en" suppressHydrationWarning>
				<head />
				<body>
					<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
						<AuthProvider session={session}>
							<Toaster position="bottom-center" reverseOrder={false} />

							<div className="flex min-h-screen w-full flex-col">
								<Header />
								<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
									{children}
								</main>
							</div>
						</AuthProvider>
					</ThemeProvider>
				</body>
			</html>
		</>
	);
}
