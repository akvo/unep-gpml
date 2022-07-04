BEGIN;
--;;
DROP TABLE invitation;
--;;
CREATE TABLE invitation
(
  id UUID PRIMARY KEY,
  stakeholder_id INTEGER NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITHOUT TIME ZONE
);
--;;
COMMIT;
