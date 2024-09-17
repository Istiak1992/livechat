'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
	isCollapsed: boolean;
	conversations: {
		id: string;
		name: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		messages: any[];
		image: string;
		variant: 'secondary' | 'ghost';
	}[];
	onClick?: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setSelectedUser: (user: any) => void;
	isMobile: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Sidebar({ conversations, setSelectedUser, isCollapsed, isMobile }: SidebarProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleSelectChat = (chat: any) => {
		setSelectedUser({ ...chat, variant: 'secondary' });
	};

	return (
		<div
			data-collapsed={isCollapsed}
			className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2 "
		>
			{!isCollapsed && (
				<div className="flex justify-between p-2 items-center">
					<div className="flex gap-2 items-center text-2xl">
						<p className="font-medium">Conversations</p>
						<span className="text-zinc-300">({conversations.length})</span>
					</div>
				</div>
			)}

			<nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
				{conversations.map((chat, index) =>
					isCollapsed ? (
						<TooltipProvider key={index}>
							<Tooltip key={index} delayDuration={0}>
								<TooltipTrigger asChild>
									<Link
										href="#"
										onClick={() => handleSelectChat(chat)}
										className={cn(
											buttonVariants({ variant: chat.variant, size: 'icon' }),
											'h-11 w-11 md:h-16 md:w-16',
											chat.variant === 'secondary' &&
												'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
										)}
									>
										<Avatar className="flex justify-center items-center">
											<AvatarImage
												src={chat.image}
												alt={chat.image}
												width={6}
												height={6}
												className="w-10 h-10 "
											/>
										</Avatar>
										<span className="sr-only">{chat.name}</span>
									</Link>
								</TooltipTrigger>

								<TooltipContent side="right" className="flex items-center gap-4">
									{chat.name}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<Link
							key={index}
							href="#"
							onClick={() => handleSelectChat(chat)}
							className={cn(
								buttonVariants({ variant: chat.variant, size: 'lg' }),
								chat.variant === 'secondary' &&
									'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink',
								'justify-start gap-4'
							)}
						>
							<Avatar className="flex justify-center items-center">
								<AvatarImage
									src={chat.image}
									alt={chat.image}
									width={6}
									height={6}
									className="w-10 h-10 "
								/>
							</Avatar>

							<div className="flex flex-col max-w-28">
								<span>{chat.name}</span>
							</div>
						</Link>
					)
				)}
			</nav>
		</div>
	);
}
