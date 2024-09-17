'use client';

import axios from 'axios';
import { AtSign, Bell, BellDot, CheckCheck, CircleUser, Package2 } from 'lucide-react';
import { getSession, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ModeToggle from '@/components/molecules/ModeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AUTHENTICATED } from '@/config/constants';
import { Role } from '@prisma/client';

export default function Header() {
	const { data: sessionData, status } = useSession();
	const userRole = sessionData?.user?.role as string | undefined;

	const router = useRouter();
	const [notifications, setNotifications] = useState([]);

	const handleLogout = async () => {
		toast.success('You have been logged out');
		await signOut();
		router.replace('/');
	};

	const fetchNotifications = async () => {
		try {
			const session = await getSession();
			const response = await axios.get(
				`/api/v1/notifications/${session?.user?.id}?role=${session?.user?.role}`,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			setNotifications(response.data.data?.notifications);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				toast.error(
					error.response.data?.message || 'An error occurred while fetching notifications'
				);
			} else {
				toast.error('An error occurred while fetching notifications');
			}
		}
	};

	// Mark all notifications as read
	const markAllAsRead = async () => {
		try {
			const session = await getSession();
			await axios.put(`/api/v1/notifications/${session?.user?.id}?role=${session?.user?.role}`, {
				headers: {
					'Content-Type': 'application/json',
				},
			});

			setNotifications([]);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				toast.error(
					error.response.data?.message ||
						'An error occurred while marking all notifications as read'
				);
			} else {
				toast.error('An error occurred while marking all notifications as read');
			}
		}
	};

	useEffect(() => {
		if (status === AUTHENTICATED) {
			fetchNotifications();
		}
	}, [status]);

	return (
		<header className="top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
			<nav className="text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
				<Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
					<Package2 className="h-6 w-6" />
				</Link>
			</nav>

			<div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
				{status !== AUTHENTICATED && (
					<Link href="/">
						<Button variant="ghost">Login</Button>
					</Link>
				)}

				{status !== AUTHENTICATED && (
					<Link href="/signup">
						<Button variant="outline">Register</Button>
					</Link>
				)}

				<ModeToggle />

				{status === AUTHENTICATED && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							{notifications?.length > 0 ? (
								<Button variant="secondary" size="icon" className="rounded-full">
									<BellDot className="h-5 w-5" />
									<span className="sr-only">Unread notifications</span>
								</Button>
							) : (
								<Button variant="secondary" size="icon" className="rounded-full">
									<Bell className="h-5 w-5" />
									<span className="sr-only">Unread notifications</span>
								</Button>
							)}
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<Card>
								<CardHeader>
									<CardTitle>Notifications</CardTitle>
									<CardDescription>Take a look at the notifications you missed.</CardDescription>
								</CardHeader>

								<CardContent className="grid gap-1 p-1.5">
									{notifications?.length > 0 ? (
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										notifications?.slice(0, 5)?.map((notification: any) => (
											<div
												key={notification.id}
												className="cursor-pointer flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
											>
												<AtSign className="h-5 w-5" />
												<div className="space-y-1">
													<p className="text-sm font-medium leading-none">{notification?.title}</p>
													<p className="text-sm text-muted-foreground">
														{new Date(notification.created_at as string).toLocaleString('en-US', {
															weekday: 'short',
															year: 'numeric',
															month: 'short',
															hour: '2-digit',
															minute: '2-digit',
															hour12: true,
														})}
													</p>
												</div>
											</div>
										))
									) : (
										<p className="text-sm text-muted-foreground text-center pb-2">
											No notifications found
										</p>
									)}

									{notifications?.length > 0 && (
										<DropdownMenuItem
											onClick={markAllAsRead}
											className="cursor-pointer flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
										>
											<Button variant="secondary" className="w-full">
												Mark all as real{' '}
												<CheckCheck size={22} className="ml-3 text-muted-foreground" />
											</Button>
										</DropdownMenuItem>
									)}
								</CardContent>
							</Card>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				{status === AUTHENTICATED && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="secondary" size="icon" className="rounded-full">
								<CircleUser className="h-5 w-5" />
								<span className="sr-only">Toggle user menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<Link href="/profile">
								<DropdownMenuItem>Profile</DropdownMenuItem>
							</Link>

							{(userRole == Role.ADMIN || userRole == Role.SUPER_ADMIN) && (
								<Link href="/admins/organization">
									<DropdownMenuItem>Organization Profile</DropdownMenuItem>
								</Link>
							)}
							{(userRole == Role.ADMIN || userRole == Role.SUPER_ADMIN) && (
								<Link href="/admins/invitations">
									<DropdownMenuItem>Invitations</DropdownMenuItem>
								</Link>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</header>
	);
}
