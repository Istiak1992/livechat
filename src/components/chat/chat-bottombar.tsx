import { AnimatePresence, motion } from 'framer-motion';
import { SendHorizontal } from 'lucide-react';
import isEmpty from 'lodash.isempty';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { EmojiPicker } from '@/components/emoji-picker';
import { COMPANY_TYPE_MESSAGE, USER_TYPE_MESSAGE } from '@/config/constants';
import { Company } from '@/types/Company';

interface ChatBottombarProps {
	isMobile: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedUser: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setChatMessages: (messages: any) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	chatMessages: any[];
	type?: string;
	companyDetails?: Company;
}

// Fetch user details by ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchCurrentUserDetails = async (userId: string, setCurrentUser: any) => {
	try {
		const response = await axios.get(`/api/v1/users/${userId}`);
		setCurrentUser(response.data?.data?.user);
	} catch (error) {
		console.error('Failed to fetch user details:', error);
	}
};

export default function ChatBottombar({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isMobile,
	selectedUser,
	setChatMessages,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	chatMessages,
	type,
	companyDetails,
}: ChatBottombarProps) {
	const [message, setMessage] = useState('');
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const { data: session } = useSession();
	const [userId, setUserId] = useState(() => session?.user?.id || '');
	const [chatId, setChatId] = useState('');
	const [socket, setSocket] = useState<Socket | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [currentUser, setCurrentUser] = useState<any>(null);

	const fetchDetails = useCallback(() => {
		if (userId) {
			fetchCurrentUserDetails(userId, setCurrentUser);
		}
	}, [userId, setCurrentUser]);

	useEffect(() => {
		if (!isEmpty(session)) {
			setUserId(session?.user?.id || '');
		}

		if (!isEmpty(selectedUser)) {
			setChatId(selectedUser?.chatId || '');
		}

		if (isEmpty(currentUser)) {
			fetchDetails();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedUser, session, currentUser]);

	useEffect(() => {
		const socketInstance = io();
		setSocket(socketInstance);

		socketInstance.on('connect', () => {
			console.log('Socket connected:', socketInstance.id);
			if (userId.trim()) {
				socketInstance.emit('userOnline', { userId });
			}
			if (chatId.trim()) {
				socketInstance.emit('joinChannel', chatId);
			}
		});

		socketInstance.on('receiveMessage', (message) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			setChatMessages((prevMessages: any[]) => [...prevMessages, message]);
		});

		socketInstance.on('disconnect', () => {
			console.log('Socket disconnected');
			if (userId.trim()) {
				socketInstance.emit('userOffline', { userId: userId });
			}
		});

		return () => {
			if (socketInstance.connected && userId.trim()) {
				socketInstance.emit('userOffline', { userId: userId });
			}
			socketInstance.disconnect();
		};
	}, [chatId, setChatMessages, userId]);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.target.value);
	};

	// Create a new message
	const createMessage = () => {
		const messageContent = message.trim();
		return {
			senderType: type === USER_TYPE_MESSAGE ? USER_TYPE_MESSAGE : COMPANY_TYPE_MESSAGE,
			content: messageContent,
			message: messageContent,
			chatId: chatId,
			userId: companyDetails?.id || currentUser.id,
			recipientId: selectedUser?.id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			sender: {
				id: companyDetails?.id || currentUser.id,
				name: companyDetails?.name || currentUser.name,
				image: companyDetails?.image || currentUser.image,
			},
		};
	};

	// Send a new message
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sendMessage = (newMessage: any) => {
		if (socket) {
			socket.emit('sendMessage', newMessage);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			setChatMessages((prevMessages: any[]) => [...prevMessages, newMessage]);
			setMessage('');
		}
	};

	// Handle sending a message
	const handleSend = () => {
		if (!message.trim() || !currentUser) {
			return;
		}

		const newMessage = createMessage();

		const senderId: string = currentUser?.id;
		const recipientId: string = selectedUser?.id;

		if (socket && chatId && senderId && recipientId) {
			console.log('new message', newMessage);
			sendMessage(newMessage);
		}

		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// Start a new conversation
	const handleStartConversation = () => {
		if (socket) {
			const initialChatDataForCompanyAndUser = { companyId: selectedUser?.id, userId };

			socket.emit(
				'createChannel',
				initialChatDataForCompanyAndUser,
				(response: { chatId: string }) => {
					if (response && response.chatId) {
						setChatId(response.chatId);
						// Create a new message
						const wave = {
							content: '👋',
							message: '👋',
							chatId: response?.chatId,
							userId: currentUser?.id,
							recipientId: selectedUser?.id,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
							sender: {
								id: currentUser.id,
								name: currentUser.name,
								image: currentUser.image,
							},
						};
						console.log('wave', wave);
						// Send the message
						sendMessage(wave);
					} else {
						console.error('Failed to create channel');
					}
				}
			);
		}

		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}

		if (event.key === 'Enter' && event.shiftKey) {
			event.preventDefault();
			setMessage((prev) => prev + '\n');
		}
	};

	if (isEmpty(selectedUser)) {
		return null;
	}

	console.log('chat id', chatId);
	console.log('selected chat conversation', selectedUser);

	return (
		<>
			{type === USER_TYPE_MESSAGE && isEmpty(chatMessages) ? (
				<Button onClick={handleStartConversation} variant="secondary" className="ml-7">
					Start conversation <SendHorizontal size={22} className="ml-3 text-muted-foreground" />
				</Button>
			) : (
				<div className="px-2 py-4 flex justify-between w-full items-center gap-2">
					<AnimatePresence initial={false}>
						<motion.div
							key="input"
							className="w-full relative"
							layout
							initial={{ opacity: 0, scale: 1 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 1 }}
							transition={{
								opacity: { duration: 0.05 },
								layout: {
									type: 'spring',
									bounce: 0.15,
								},
							}}
						>
							<ChatInput
								value={message}
								ref={inputRef}
								onKeyDown={handleKeyPress}
								onChange={handleInputChange}
								placeholder="Type a message..."
								className="rounded-full min-h-14 resize-none bg-background border-0 p-3 shadow-none focus-visible:ring-1 text-lg"
							/>
							<div className="absolute right-4 bottom-2.5">
								<EmojiPicker
									onChange={(value) => {
										setMessage(message + value);
										if (inputRef.current) {
											inputRef.current.focus();
										}
									}}
								/>
							</div>
						</motion.div>
						<Button className="h-9 w-9 shrink-0" onClick={handleSend} variant="ghost" size="icon">
							<SendHorizontal size={22} className="text-muted-foreground" />
						</Button>
					</AnimatePresence>
				</div>
			)}
		</>
	);
}
