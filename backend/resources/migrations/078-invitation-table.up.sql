CREATE TABLE invitation (
       id serial NOT NULL PRIMARY KEY,
       stakeholder integer NOT NULL REFERENCES stakeholder(id),
       organisation integer NOT NULL REFERENCES organisation(id),
       email text NOT NULL unique,
       created timestamptz DEFAULT now(),
       accepted timestamptz DEFAULT NULL);
