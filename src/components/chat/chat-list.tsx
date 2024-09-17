import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import isEmpty from 'lodash.isempty';

import {
	ChatBubble,
	ChatBubbleAvatar,
	ChatBubbleMessage,
	ChatBubbleTimestamp,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import ChatBottombar from '@/components/chat/chat-bottombar';
import { useSession } from 'next-auth/react';
import { USER_TYPE_MESSAGE } from '@/config/constants';
import { Company } from '@/types/Company';

interface ChatListProps {
	userId: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	messages: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedUser: any;
	isMobile: boolean;
	type?: string;
	companyDetails?: Company;
}

const getMessageVariant = (senderId: string, userId: string) => {
	if (senderId === userId) {
		return 'sent';
	}
	return 'received';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChatList({
	messages,
	selectedUser,
	isMobile,
	type,
	companyDetails,
}: ChatListProps) {
	const { data: session } = useSession();
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [chatMessages, setChatMessages] = useState([]);

	useEffect(() => {
		setChatMessages(messages);
	}, [messages]);

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [chatMessages]);

	return (
		<div className="w-full overflow-y-auto flex flex-col  h-[80vh]">
			{!isEmpty(selectedUser) && (
				<ChatMessageList ref={messagesContainerRef}>
					{isEmpty(chatMessages) && !isEmpty(selectedUser) && (
						<div className="flex items-center justify-center h-full">
							<p className="text-muted-foreground">
								{type === USER_TYPE_MESSAGE
									? 'For start messaging click on the Start conversation button'
									: 'Send a message to start the conversation'}
							</p>
						</div>
					)}

					{isEmpty(selectedUser) && (
						<div className="flex items-center justify-center h-full p-6">
							<p className="text-muted-foreground">Select a conversation to chat with</p>
						</div>
					)}

					<AnimatePresence>
						{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
						{chatMessages.map((message: any, index: number) => {
							const senderId = message.sender?.id;
							const userId = session?.user?.id;
							const variant = getMessageVariant(senderId, userId as string);

							return (
								<motion.div
									key={index}
									layout
									initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
									animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
									exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
									transition={{
										opacity: { duration: 0.1 },
										layout: {
											type: 'spring',
											bounce: 0.3,
											duration: index * 0.05 + 0.2,
										},
									}}
									style={{ originX: 0.5, originY: 0.5 }}
									className="flex flex-col gap-2"
								>
									<ChatBubble variant={variant}>
										<ChatBubbleAvatar src={message.sender?.image as string} />
										<ChatBubbleMessage variant={variant} isLoading={message.isLoading}>
											{message.content as string}
											{message.created_at && (
												<ChatBubbleTimestamp
													timestamp={new Date(message.created_at as string).toLocaleString(
														'en-US',
														{
															weekday: 'short',
															year: 'numeric',
															month: 'short',
															hour: '2-digit',
															minute: '2-digit',
															hour12: true,
														}
													)}
												/>
											)}
										</ChatBubbleMessage>
									</ChatBubble>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</ChatMessageList>
			)}

			<ChatBottombar
				type={type}
				companyDetails={companyDetails}
				isMobile={isMobile}
				setChatMessages={setChatMessages}
				selectedUser={selectedUser}
				chatMessages={chatMessages}
			/>
		</div>
	);
}
