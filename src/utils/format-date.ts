export const formatDate = (dateString: Date): string => {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'short',
	};
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', options);
};
