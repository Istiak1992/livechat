export interface Message {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	created_at?: any;
	content?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sender?: any;
	id: number;
	avatar: string;
	name: string;
	message?: string;
	isLoading?: boolean;
	timestamp?: string;
	role?: string;
}

export interface User {
	id: string | number;
	avatar: string;
	messages: Message[];
	name: string;
}
