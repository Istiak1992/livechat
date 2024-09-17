'use client';

import { useEffect, useState } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { Chat } from '@/components/chat/chat';
import { useSession } from 'next-auth/react';

interface ChatLayoutProps {
	defaultLayout: number[] | undefined;
	defaultCollapsed?: boolean;
	navCollapsedSize: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	users: any;
	type?: string;
}

export function ChatLayout({
	defaultLayout = [320, 480],
	defaultCollapsed = false,
	navCollapsedSize,
	users = [],
	type,
}: ChatLayoutProps) {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [selectedUser, setSelectedUser] = useState({} as any);
	const [isMobile, setIsMobile] = useState(false);

	const [currentConversations, setCurrentConversations] = useState([]);
	const { data: session } = useSession();
	const userId = session?.user?.id;

	useEffect(() => {
		const checkScreenWidth = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		// Initial check
		checkScreenWidth();
		// Event listener for screen width changes
		window.addEventListener('resize', checkScreenWidth);
		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener('resize', checkScreenWidth);
		};
	}, []);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const conversationUsers = users.map((user: any) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const currentChats = user.chats.find((chat: any) => chat.user_id === userId);

			if (currentChats) {
				return {
					id: user.id,
					chatId: currentChats.id,
					name: user.name || `${user?.first_name} ${user?.last_name}`,
					messages: currentChats.messages || [],
					image: user.image,
					variant: selectedUser?.id === user.id ? 'secondary' : 'ghost',
				};
			}

			return {
				id: user.id,
				name: user.name || `${user?.first_name} ${user?.last_name}`,
				messages: [],
				image: user.image,
				variant: selectedUser?.id === user.id ? 'secondary' : 'ghost',
			};
		});

		setCurrentConversations(conversationUsers);
	}, [selectedUser, userId, users]);

	console.log('users those send message to us', users);
	console.log('current conversations', currentConversations);

	return (
		<ResizablePanelGroup
			direction="horizontal"
			onLayout={(sizes: number[]) => {
				document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
			}}
			className="h-full items-stretch"
		>
			<ResizablePanel
				defaultSize={defaultLayout[0]}
				collapsedSize={navCollapsedSize}
				collapsible={true}
				minSize={isMobile ? 0 : 24}
				maxSize={isMobile ? 8 : 30}
				onCollapse={() => {
					setIsCollapsed(true);
					document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
				}}
				onExpand={() => {
					setIsCollapsed(false);
					document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
				}}
				className={cn(
					isCollapsed && 'min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out'
				)}
			>
				<Sidebar
					isCollapsed={isCollapsed || isMobile}
					setSelectedUser={setSelectedUser}
					conversations={currentConversations}
					isMobile={isMobile}
				/>
			</ResizablePanel>
			<ResizableHandle withHandle />

			<ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
				<Chat
					type={type}
					messages={selectedUser?.messages || []}
					selectedUser={selectedUser}
					isMobile={isMobile}
				/>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
