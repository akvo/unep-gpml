CREATE TYPE topic_name AS ENUM (
  'stakeholder', 'organisation', 'technology', 'policy', 'resource', 'event', 'initiative'
);

-- FIXME: Ideally, we would rename the existing review_status type to
-- approval_status, and rename the field on all the topics/resources,
-- but this is going to be quite a big rename/refactor to do now.

CREATE TYPE reviewer_review_status AS ENUM (
  'PENDING', 'ACCEPTED', 'REJECTED'
);

CREATE TABLE review (
  id serial NOT NULL PRIMARY KEY,
  topic_name topic_name NOT NULL,
  topic_id integer NOT NULL,
  assigned_by integer NOT NULL REFERENCES stakeholder(id),
  assigned timestamptz DEFAULT now(),
  reviewer integer NOT NULL REFERENCES stakeholder(id),
  reviewed timestamptz DEFAULT NULL,
  review_status reviewer_review_status NOT NULL DEFAULT 'PENDING',
  review_comment text,
  UNIQUE(topic_name, topic_id)
);

CREATE INDEX review_topic_name_id_idx ON review (topic_name, topic_id);
CREATE INDEX review_reviewer_idx ON review (reviewer);
