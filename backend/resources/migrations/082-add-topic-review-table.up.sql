CREATE TYPE topic_type AS ENUM (
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
  topic_type topic_type NOT NULL,
  topic_id integer NOT NULL,
  assigned_by integer NOT NULL REFERENCES stakeholder(id),
  created timestamptz DEFAULT now(),
  reviewer integer NOT NULL REFERENCES stakeholder(id),
  modified timestamptz DEFAULT NULL,
  review_status reviewer_review_status NOT NULL DEFAULT 'PENDING',
  review_comment text,
  UNIQUE(topic_type, topic_id)
);

DO $$
BEGIN
    PERFORM install_update_modified('review');
END$$;
--;;

-- Add indexes for querying reviews by topic_type/topic_id and reviewer
CREATE INDEX review_topic_type_id_idx ON review (topic_type, topic_id);
CREATE INDEX review_reviewer_idx ON review (reviewer);
