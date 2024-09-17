// eslint-disable-next-line import/no-anonymous-default-export
export default {
	database_url: process.env.DATABASE_URL,

	jwt: {
		secret: process.env.JWT_SECRET,
		expires_in: process.env.JWT_EXPIRES_IN,
		refresh_secret: process.env.JWT_REFRESH_SECRET,
		refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
	},
};
