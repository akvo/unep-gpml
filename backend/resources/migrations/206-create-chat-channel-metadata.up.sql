CREATE TABLE chat_channel_input_box (
  stakeholder_id INTEGER REFERENCES stakeholder(id) ON DELETE CASCADE,
  chat_channel_id TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (stakeholder_id, chat_channel_id)
);
