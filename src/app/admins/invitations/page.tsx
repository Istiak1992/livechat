'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import InvitationForm from '@/components/molecules/InvitationForm';
import { CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/utils/format-date';
import { Invite } from '@prisma/client';

const Invitations = () => {
	const { data: sessionData } = useSession();
	const token = sessionData?.user?.accessToken as string | undefined;

	const [invitations, setInvitations] = useState<Invite[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvitations = async () => {
			if (!token) return;

			try {
				const response = await axios.get('/api/v1/invitations', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.status === 200) {
					setInvitations(response.data.data.invitations);
					setError(null);
				} else {
					console.error('Unexpected response status:', response.status);
					setError('Unexpected response status');
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error('Axios error:', error.response?.data);
					toast.error(
						(error.response?.data?.message as string) || 'Failed to invite. Please try again.'
					);
					setError(error.response?.data?.message || 'Failed to invite. Please try again.');
				} else {
					console.error('Unexpected error:', error);
					toast.error('An unexpected error occurred. Please try again.');
					setError('An unexpected error occurred. Please try again.');
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchInvitations();
	}, [token]);


	return (
		<div>
			<div className="flex flex-col md:flex-row md:justify-between items-center gap-2">
				<CardTitle className="text-xl">A list of invited admins</CardTitle>
				<InvitationForm />
			</div>

			{isLoading && (
				<div role="status" className="flex justify-center mt-5">
					<svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
						<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
					</svg>
					<span className="sr-only">Loading...</span>
				</div>
			)}

			{error && (
				<div className="flex justify-center">
					<p className="text-red-500 text-sm">{error}</p>
				</div>
			)}


			{!isLoading && !error && invitations?.length > 0 && (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]"></TableHead>
							<TableHead>EMAIL</TableHead>
							<TableHead>ROLE</TableHead>
							<TableHead>STATUS</TableHead>
							<TableHead className="text-right">INVITED AT</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invitations?.map((invitation, index) => (
							<TableRow key={invitation.id}>
								<TableCell className="font-medium">{index + 1}</TableCell>
								<TableCell>{invitation.email}</TableCell>
								<TableCell>{invitation.role}</TableCell>
								<TableCell>{invitation.status}</TableCell>
								<TableCell className="text-right">{formatDate(invitation.created_at)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
};

export default Invitations;
