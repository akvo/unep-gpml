CREATE TABLE action(
  id serial NOT NULL PRIMARY KEY,
  code integer NOT NULL UNIQUE,
  parent integer NULL REFERENCES action(code),
  name text NOT NULL
);

CREATE TABLE action_detail(
  id serial NOT NULL PRIMARY KEY,
  code integer NOT NULL UNIQUE,
  parent integer REFERENCES action_detail(code),
  action integer REFERENCES action(id),
  name text NOT NULL
);

CREATE TABLE project(
  id serial NOT NULL PRIMARY KEY,
  uuid text NOT NULL UNIQUE,
  phase smallint,
  funds decimal,
  contribution decimal,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
-- ;;

DO $$
BEGIN
    PERFORM install_update_modified('project');
END$$;
--;;

CREATE TABLE project_country(
  id serial NOT NULL PRIMARY KEY,
  project integer REFERENCES project(id),
  country integer REFERENCES country(id)
);

CREATE TABLE project_action(
  id serial NOT NULL PRIMARY KEY,
  project integer REFERENCES project(id),
  action integer REFERENCES action(id)
);

CREATE TABLE project_action_detail(
  id serial NOT NULL PRIMARY KEY,
  project integer REFERENCES project(id),
  action_detail integer REFERENCES action_detail(id),
  value text
);
