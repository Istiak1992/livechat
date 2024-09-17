import { cookies } from 'next/headers';

import { ChatLayout } from '@/components/chat/chat-layout';
import prisma from '@/lib/prisma';
import { USER_TYPE_MESSAGE } from '@/config/constants';

export default async function Home() {
	const layout = cookies().get('react-resizable-panels:layout');
	const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

	const companies = await prisma.company.findMany({
		where: {
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

	console.log('users chats:', companies);

	return (
		<div className="w-full">
			<ChatLayout
				type={USER_TYPE_MESSAGE}
				users={companies}
				defaultLayout={defaultLayout}
				navCollapsedSize={8}
			/>
		</div>
	);
}
