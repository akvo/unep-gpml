BEGIN;
--;;
--;; Create translation tables for each resource type.
--;;
CREATE TABLE IF NOT EXISTS policy_translation (
  policy_id INTEGER,
  translatable_field TEXT,
  language VARCHAR(3),
  value TEXT NOT NULL,
  PRIMARY KEY (policy_id, translatable_field, language),
  FOREIGN KEY (policy_id) REFERENCES policy(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE
);
--;;
CREATE TABLE IF NOT EXISTS event_translation (
  event_id INTEGER,
  translatable_field TEXT,
  language VARCHAR(3),
  value TEXT NOT NULL,
  PRIMARY KEY (event_id, translatable_field, language),
  FOREIGN KEY (event_id) REFERENCES event(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE
);
--;;
CREATE TABLE IF NOT EXISTS initiative_translation (
  initiative_id INTEGER,
  translatable_field TEXT,
  language VARCHAR(3),
  value TEXT NOT NULL,
  PRIMARY KEY (initiative_id, translatable_field, language),
  FOREIGN KEY (initiative_id) REFERENCES initiative(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE
);
--;;
CREATE TABLE IF NOT EXISTS resource_translation (
  resource_id INTEGER,
  translatable_field TEXT,
  language VARCHAR(3),
  value TEXT NOT NULL,
  PRIMARY KEY (resource_id, translatable_field, language),
  FOREIGN KEY (resource_id) REFERENCES resource(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE
);
--;;
CREATE TABLE IF NOT EXISTS technology_translation (
  technology_id INTEGER,
  translatable_field TEXT,
  language VARCHAR(3),
  value TEXT NOT NULL,
  PRIMARY KEY (technology_id, translatable_field, language),
  FOREIGN KEY (technology_id) REFERENCES technology(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE
);
--;;
COMMIT;