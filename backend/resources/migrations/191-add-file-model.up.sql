BEGIN;
--;;
CREATE TYPE FILE_VISIBILITY AS ENUM ('public', 'private');
--;;
CREATE TABLE file (
  id UUID PRIMARY KEY,
  object_key TEXT NOT NULL,
  name TEXT NOT NULL,
  alt_desc TEXT,
  type TEXT NOT NULL,
  extension TEXT,
  visibility FILE_VISIBILITY NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  last_modified_at TIMESTAMP WITHOUT TIME ZONE
);
--;;
COMMIT;
