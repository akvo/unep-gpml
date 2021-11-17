CREATE TABLE topic_stakeholder_auth (
   id serial PRIMARY KEY,
   stakeholder integer NOT NULL REFERENCES stakeholder(id),
   topic_id integer NOT NULL,
   topic_type topic_type NOT NULL,
   roles jsonb NOT NULL DEFAULT '[]',
   created timestamptz NOT NULL DEFAULT now(),
   modified timestamptz NOT NULL DEFAULT now(),
   UNIQUE(stakeholder, topic_id, topic_type)
);

CREATE INDEX topic_stakeholder_auth_topic_type_id_idx ON topic_stakeholder_auth (topic_type, topic_id);

DO $$
BEGIN
    PERFORM install_update_modified('topic_stakeholder_auth');
END$$;
