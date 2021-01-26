CREATE TYPE topic_type AS
ENUM ('technology', 'resource', 'policy',
      'event', 'project', 'stakeholder');

CREATE TABLE stakeholder_portfolio (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  tag integer NOT NULL REFERENCES tag(id),
  topic_type topic_type NOT NULL,
  topic integer NOT NULL,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, tag, topic_type, topic)
);
