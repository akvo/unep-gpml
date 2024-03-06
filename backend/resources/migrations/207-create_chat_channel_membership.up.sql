DROP TABLE chat_channel_input_box;
--;;
CREATE TABLE chat_channel_membership (
  stakeholder_id INTEGER REFERENCES stakeholder(id) ON DELETE CASCADE,
  chat_channel_id TEXT NOT NULL,
  PRIMARY KEY (stakeholder_id, chat_channel_id)
);
