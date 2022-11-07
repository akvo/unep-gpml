BEGIN;
--;;
CREATE TABLE country_state (
  id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT,
  country_id INTEGER NOT NULL REFERENCES country(id)
);
--;;
CREATE TABLE initiative_country_state (
  initiative_id INTEGER NOT NULL REFERENCES initiative(id) ON DELETE CASCADE,
  country_state_id INTEGER NOT NULL REFERENCES country_state(id) ON DELETE CASCADE
);
--;;
CREATE TABLE policy_country_state (
 policy_id INTEGER NOT NULL REFERENCES policy(id) ON DELETE CASCADE,
 country_state_id INTEGER NOT NULL REFERENCES country_state(id) ON DELETE CASCADE
);
--;;
CREATE TABLE event_country_state (
  event_id INTEGER NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  country_state_id INTEGER NOT NULL REFERENCES country_state(id) ON DELETE CASCADE
);
--;;
CREATE TABLE technology_country_state (
 technology_id INTEGER NOT NULL REFERENCES technology(id) ON DELETE CASCADE,
 country_state_id INTEGER NOT NULL REFERENCES country_state(id) ON DELETE CASCADE
);
--;;
CREATE TABLE resource_country_state (
 resource_id INTEGER NOT NULL REFERENCES resource(id) ON DELETE CASCADE,
 country_state_id INTEGER NOT NULL REFERENCES country_state(id) ON DELETE CASCADE
);
--;;
ALTER TABLE initiative_country_state
ADD CONSTRAINT initiative_country_state_pkey PRIMARY KEY (initiative_id, country_state_id);
--;;
ALTER TABLE policy_country_state
ADD CONSTRAINT policy_country_state_pkey PRIMARY KEY (policy_id, country_state_id);
--;;
ALTER TABLE event_country_state
ADD CONSTRAINT event_country_state_pkey PRIMARY KEY (event_id, country_state_id);
--;;
ALTER TABLE technology_country_state
ADD CONSTRAINT technology_country_state_pkey PRIMARY KEY (technology_id, country_state_id);
--;;
ALTER TABLE resource_country_state
ADD CONSTRAINT resource_country_state_pkey PRIMARY KEY (resource_id, country_state_id);
--;;
COMMIT;
