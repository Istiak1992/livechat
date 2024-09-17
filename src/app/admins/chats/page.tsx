import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';

import { ChatLayout } from '@/components/chat/admin-chat-layout';
import prisma from '@/lib/prisma';
import { authOptions } from '@/utils/auth-options';
import { Company } from '@/types/Company';

export default async function Home() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const session: any = await getServerSession(authOptions);
	const userId = session?.user?.id as string;

	const layout = cookies().get('react-resizable-panels:layout');
	const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			company: {
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					image: true,
				},
			},
		},
	});

	const companyId = user?.company?.id as string;

	const company = await prisma.company.findUnique({
		where: {
			id: companyId,
			is_deleted: false,
		},
		select: {
			id: true,
			name: true,
			image: true,
			chats: {
				select: {
					id: true,
					user_id: true,
					company_id: true,
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					messages: {
						select: {
							id: true,
							content: true,
							created_at: true,
							updated_at: true,
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
							company: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
				},
			},
			created_at: true,
		},
	});

	const companyDetails: Company = {
		id: company?.id ?? null,
		name: company?.name ?? null,
		image: company?.image ?? null,
	};

	console.log('admins chats:', company);

	const users =
		company?.chats.map((chat) => ({
			id: chat?.user?.id,
			name: chat.user.name,
			image: chat.user.image,
			variant: 'ghost',
			chatId: chat.id,
			messages: chat.messages.map((message) => ({
				id: message.id,
				content: message.content,
				created_at: message.created_at,
				updated_at: message.updated_at,
				user: message.user,
				company: message.company,
			})),
		})) || [];

	return (
		<div className="w-full">
			<ChatLayout
				companyDetails={companyDetails}
				users={users}
				defaultLayout={defaultLayout}
				navCollapsedSize={8}
			/>
		</div>
	);
}
