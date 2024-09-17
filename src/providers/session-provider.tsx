'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface AuthProviderProps {
	children: ReactNode;
	session: Session | null;
}

const AuthProvider = ({ children, session }: AuthProviderProps) => {
	return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default AuthProvider;
