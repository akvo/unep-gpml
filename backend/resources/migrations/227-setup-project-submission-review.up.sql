BEGIN;

ALTER TABLE IF EXISTS project ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE IF EXISTS project ADD COLUMN IF NOT EXISTS reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE IF EXISTS project ADD COLUMN IF NOT EXISTS review_status review_status DEFAULT 'SUBMITTED';
ALTER TABLE IF EXISTS project ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

ALTER TYPE topic_type ADD VALUE 'project';

CREATE TABLE IF NOT EXISTS project_badge (
  project_id INTEGER REFERENCES project(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT project_badge_pkey PRIMARY KEY (project_id, badge_id)
);

COMMIT;
