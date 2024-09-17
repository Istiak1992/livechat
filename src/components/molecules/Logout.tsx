'use client';

import { signOut } from 'next-auth/react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Logout = () => {
	const router = useRouter();

	const handleLogout = async () => {
		toast.success('You have been logged out');
		await signOut();
		router.replace('/');
	};

	return <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>;
};

export default Logout;
