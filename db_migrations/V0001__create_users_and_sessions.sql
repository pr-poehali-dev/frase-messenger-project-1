CREATE TABLE IF NOT EXISTS t_p79293718_frase_messenger_proj.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) NOT NULL DEFAULT '',
    color VARCHAR(20) NOT NULL DEFAULT '#a855f7',
    online BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p79293718_frase_messenger_proj.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p79293718_frase_messenger_proj.users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p79293718_frase_messenger_proj.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON t_p79293718_frase_messenger_proj.sessions(user_id);
