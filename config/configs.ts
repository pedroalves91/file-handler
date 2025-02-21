export default () => {
  return {
    server: {
      port: process.env.SERVER_PORT || 3000,
    },
    auth: {
      secret: process.env.SECRET_KEY || '53CR3TK3Y',
      expirationTime: process.env.EXPIRATION_TIME || 3600,
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      name: process.env.DB_NAME || 'users',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'r00t',
    },
  };
};
