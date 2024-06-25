const env = process.env;

const config = {
    db: { 
        host: env.DB_HOST || 'localhost',
        user: env.DB_USER || 'arinadobryden',
        password: env.DB_PASSWORD || 'root',
        database: env.DB_NAME || 'lab4',
        waitForConnections: true,
        connectionLimit: env.DB_CONN_LIMIT || 10,
        queueLimit: 0
    },
    email: {
        service: 'gmail',
        auth: {
            user: env.EMAIL_USER || 'arinuzika@gmail.com',
            pass: env.EMAIL_PASS || 'chos nhyb wfjx rssx'
        }
    }
};

module.exports = config;
