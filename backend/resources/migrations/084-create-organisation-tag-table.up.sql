CREATE TABLE organisation_tag (
  id serial NOT NULL PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  tag integer NOT NULL REFERENCES tag(id)
);
