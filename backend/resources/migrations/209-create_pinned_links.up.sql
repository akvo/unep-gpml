CREATE TABLE chat_channel_pinned_link (
  id SERIAL PRIMARY KEY,
  created_by_stakeholder_id INTEGER REFERENCES stakeholder(id) ON DELETE SET NULL,
  updated_by_stakeholder_id INTEGER REFERENCES stakeholder(id) ON DELETE SET NULL,
  chat_channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE INDEX idx_chat_channel_pinned_link_created_by_stakeholder_id ON chat_channel_pinned_link(created_by_stakeholder_id);
CREATE INDEX idx_chat_channel_pinned_link_chat_channel_id ON chat_channel_pinned_link(chat_channel_id);
CREATE INDEX idx_chat_channel_pinned_link_title ON chat_channel_pinned_link(title);
CREATE INDEX idx_chat_channel_pinned_link_url ON chat_channel_pinned_link(url);
CREATE INDEX idx_chat_channel_pinned_link_type ON chat_channel_pinned_link(type);
