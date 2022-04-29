BEGIN;
--;;
CREATE TYPE RESOURCE_TYPE AS ENUM (
    'policy',
    'event',
    'initiative',
    'technical_resource',
    'financing_resource',
    'action_plan',
    'technology'
);
--;;
CREATE TABLE comment (
    id uuid PRIMARY KEY,
    author_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
    parent_id uuid REFERENCES comment (id) ON DELETE CASCADE,
    resource_id integer NOT NULL,
    resource_type RESOURCE_TYPE NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL,
    title text NOT NULL,
    content text NOT NULL
);
--;;
COMMIT;
