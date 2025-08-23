CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--bun:split

CREATE INDEX users_username_idx ON users (username);

--bun:split

CREATE TABLE user_credentials (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    pass_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

--bun:split

CREATE INDEX user_credentials_user_id_idx ON user_credentials (user_id);

--bun:split

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

--bun:split

CREATE INDEX documents_owner_id_idx ON documents (owner_id);

--bun:split

CREATE TABLE characters (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL,
    position INTEGER[] NOT NULL,
    value CHAR(1) NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

--bun:split

CREATE INDEX characters_document_id_idx ON characters (document_id);

--bun:split

CREATE TABLE operations (
    type VARCHAR(8) NOT NULL,
    document_id UUID NOT NULL,
    chr_id UUID NOT NULL,
    value CHAR(1) NOT NULL,
    position INTEGER[] NOT NULL,
    client_id UUID NOT NULL,
    counter INTEGER NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

--bun:split

CREATE INDEX operations_document_id_idx ON operations (document_id);
