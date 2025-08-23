CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

--bun:split

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
