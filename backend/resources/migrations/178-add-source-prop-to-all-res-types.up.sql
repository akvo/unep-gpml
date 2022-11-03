BEGIN;
--;; Create new resource source enum
--;;
CREATE TYPE RESOURCE_SOURCE AS ENUM('gpml','cobsea');
--;;
--;; Add it to each resource type as not null with predefined value to indicate
--;; that by default the content source is the gpml platform.
ALTER TABLE IF EXISTS policy
  ADD COLUMN source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml';
--;;
ALTER TABLE IF EXISTS event
  ADD COLUMN source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml';
--;;
ALTER TABLE IF EXISTS initiative
  ADD COLUMN source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml';
--;;
ALTER TABLE IF EXISTS resource
  ADD COLUMN source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml';
--;;
ALTER TABLE IF EXISTS technology
  ADD COLUMN source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml';
--;;
ALTER TABLE IF EXISTS project
  ADD COLUMN source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml';
--;;
COMMIT;