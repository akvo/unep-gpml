CREATE TABLE stakeholder_cv (
  id serial NOT NULL PRIMARY KEY,
  cv text NOT NULL
);

ALTER TABLE stakeholder ADD COLUMN cv text;
