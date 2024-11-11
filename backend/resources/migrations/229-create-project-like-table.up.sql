CREATE TABLE project_like (
  project_id integer NOT NULL REFERENCES project (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (project_id, stakeholder_id)
);

