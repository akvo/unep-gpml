DELETE FROM country_group WHERE id > 120 AND id < 161;

ALTER TABLE country_group DROP CONSTRAINT country_group_name_type_key;
ALTER TABLE country_group ADD CONSTRAINT country_group_name_key UNIQUE(name);
