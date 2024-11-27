CREATE TABLE project_language_url (
  id serial NOT NULL PRIMARY KEY,
  project integer NOT NULL REFERENCES project(id),
  language integer NOT NULL REFERENCES language(id),
  url text
);
