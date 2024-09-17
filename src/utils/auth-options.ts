import axios from 'axios';
import { DefaultSession, Session, SessionOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			accessToken: string;
			refreshToken: string;
			role: string;
		};
	}

	interface User {
		id: string;
		accessToken: string;
		refreshToken: string;
		role: string;
		name?: string | null | undefined;
		email?: string | null | undefined;
		image?: string | null | undefined;
	}
}

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			authorize: async (credentials: Record<'email' | 'password', string> | undefined) => {
				try {
					const res = await axios.post(
						`${process.env.NEXTAUTH_URL}/api/v1/auth/signin`,
						credentials,
						{
							headers: { 'Content-Type': 'application/json' },
						}
					);

					const user = res.data;
					if (res.status === 200 && user) {
						return {
							id: user?.data?.id,
							accessToken: user?.data?.access_token,
							refreshToken: user?.data?.refresh_token,
							role: user?.data?.role,
							name: user?.data?.name,
						};
					} else {
						return null;
					}
				} catch (error) {
					console.error('Error during authentication:', error);
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: '/',
	},
	session: {
		jwt: true,
	} as Partial<SessionOptions>,
	callbacks: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async jwt({ token, user }: { token: any; user: any }) {
			if (user) {
				token.accessToken = user.accessToken;
				token.id = user.id;
				token.name = user.name as string;
				token.role = user.role;
			}
			return token;
		},

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async session({ session, token }: { session: Session; token: any }) {
			if (session.user) {
				session.user = {
					...session.user,
					id: token.id as string,
					name: token.name as string,
					role: token.role as string,
					accessToken: token.accessToken as string,
				} as User;
			}
			return session as Session | DefaultSession;
		},
	},
};
