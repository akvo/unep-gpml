CREATE TABLE initiative_tag (
id integer NOT NULL,
initiative integer NOT NULL references initiative(id),
tag integer NOT NULL references tag(id)
);