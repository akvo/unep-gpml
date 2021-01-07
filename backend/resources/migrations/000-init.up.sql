CREATE TABLE country (
  id serial NOT NULL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  iso_code char(3) NOT NULL UNIQUE
);
-- Sample data
INSERT INTO country (name, iso_code)
VALUES ('Bulgaria', 'BGR'),
       ('Finland', 'FIN'),
       ('India', 'IND'),
       ('Indonesia', 'IDN'),
       ('Spain', 'ESP');
