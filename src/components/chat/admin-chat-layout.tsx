/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { Chat } from '@/components/chat/chat';
import { useSession } from 'next-auth/react';
import { Company } from '@/types/Company';

interface ChatLayoutProps {
	defaultLayout: number[] | undefined;
	defaultCollapsed?: boolean;
	navCollapsedSize: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	users: any;
	companyDetails: Company;
}

export function ChatLayout({
	defaultLayout = [320, 480],
	defaultCollapsed = false,
	navCollapsedSize,
	users = [],
	companyDetails,
}: ChatLayoutProps) {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	const [isMobile, setIsMobile] = useState(false);

	const { data: session } = useSession();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [selectedUser, setSelectedUser] = useState({} as any);
	const [userChats, setChatUsers] = useState([]);

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
		setChatUsers(users);
	}, [users]);

	console.log('users those send message to us', users);
	console.log('logged in company id', companyDetails?.id);

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
					conversations={userChats}
					isMobile={isMobile}
				/>
			</ResizablePanel>
			<ResizableHandle withHandle />

			<ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
				<Chat
					companyDetails={companyDetails}
					messages={selectedUser?.messages || []}
					selectedUser={selectedUser}
					isMobile={isMobile}
				/>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
