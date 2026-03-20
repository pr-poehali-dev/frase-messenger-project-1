CREATE TABLE IF NOT EXISTS t_p79293718_frase_messenger_proj.conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES t_p79293718_frase_messenger_proj.users(id),
    user2_id INTEGER NOT NULL REFERENCES t_p79293718_frase_messenger_proj.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS t_p79293718_frase_messenger_proj.messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES t_p79293718_frase_messenger_proj.conversations(id),
    sender_id INTEGER NOT NULL REFERENCES t_p79293718_frase_messenger_proj.users(id),
    text TEXT NOT NULL DEFAULT '',
    type VARCHAR(10) NOT NULL DEFAULT 'text',
    duration VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON t_p79293718_frase_messenger_proj.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON t_p79293718_frase_messenger_proj.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON t_p79293718_frase_messenger_proj.conversations(user2_id);
