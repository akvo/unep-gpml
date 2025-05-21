CREATE TYPE notification_status AS ENUM('read', 'unread');

CREATE TABLE notification (
    id serial NOT NULL PRIMARY KEY,
    stakeholder integer NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
    status notification_status NOT NULL DEFAULT 'unread',
    type varchar(127),
    sub_type varchar(127),
    context_id varchar(127),
    sub_context_id varchar(127),
    title text,
    content jsonb
);
