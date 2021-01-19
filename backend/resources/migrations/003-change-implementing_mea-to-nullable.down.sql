ALTER TABLE policy
DROP COLUMN implementing_mea,
ADD COLUMN implementing_mea integer NOT NULL REFERENCES country_group(id);
