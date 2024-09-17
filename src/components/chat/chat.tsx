import { useSession } from 'next-auth/react';
import isEmpty from 'lodash.isempty';

import { ChatList } from '@/components/chat/chat-list';
import ChatTopbar from '@/components/chat/chat-topbar';
import { Company } from '@/types/Company';

interface ChatProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	messages?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedUser: any;
	isMobile: boolean;
	type?: string;
	companyDetails?: Company;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Chat({ messages, selectedUser, isMobile, type, companyDetails }: ChatProps) {
	const { data: session } = useSession();

	return (
		<div className="flex flex-col justify-between w-full h-full">
			{!isEmpty(selectedUser) && <ChatTopbar selectedUser={selectedUser} />}

			<ChatList
				type={type}
				companyDetails={companyDetails}
				userId={session?.user?.id as string}
				messages={messages}
				selectedUser={selectedUser}
				isMobile={isMobile}
			/>
		</div>
	);
}
