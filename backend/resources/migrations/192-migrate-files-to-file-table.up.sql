BEGIN;
--;;
-- Create temporary tables transition data old data to the new table.
CREATE TABLE temp_entity_images (
  id UUID,
  entity_id INTEGER,
  entity_type TEXT,
  object_key TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  extension TEXT,
  visibility FILE_VISIBILITY NOT NULL
);
--;;
CREATE TABLE temp_entity_thumbnails (
  id UUID,
  entity_id INTEGER,
  entity_type TEXT,
  object_key TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  extension TEXT,
  visibility FILE_VISIBILITY NOT NULL
);
--;;
-- Add foreign keys to all tables that uses files in their model to
-- point to the File table.
ALTER TABLE organisation
ADD COLUMN logo_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE stakeholder
ADD COLUMN picture_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN cv_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE event
ADD COLUMN image_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE policy
ADD COLUMN image_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE technology
ADD COLUMN image_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE initiative
ADD COLUMN image_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE resource
ADD COLUMN image_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;
ALTER TABLE case_study
ADD COLUMN image_id UUID REFERENCES file (id) ON DELETE SET NULL,
ADD COLUMN thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL;
--;;

-- Gather all the entity images and only process those pointing to
-- GCS. This is done for both images and thumbnails. We are going to
-- store thumbnails in the same folder as the normal images for
-- historic reasons. Because there was no distinction between images
-- and thumbnails in the previous implementations. So when moving the
-- existing images to the new bucket structure we can't distinguish
-- between both types easily.
WITH entity_images AS (
	SELECT id AS entity_id, 'organisation' AS entity_type, logo AS image
	FROM organisation
	UNION
	SELECT id AS entity_id, 'event' AS entity_type, image AS image
	FROM event
	UNION
	SELECT id AS entity_id, 'policy' AS entity_type, image AS image
	FROM policy
	UNION
	SELECT id AS entity_id, 'initiative' AS entity_type, qimage AS image
	FROM initiative
	UNION
	SELECT id AS entity_id, 'resource' AS entity_type, image AS image
	FROM resource
	UNION
	SELECT id AS entity_id, 'technology' AS entity_type, image AS image
	FROM technology
	UNION
	SELECT id AS entity_id, 'case_study' AS entity_type, image AS image
	FROM case_study
)
-- Just images that were previously in GCS.
INSERT INTO temp_entity_images (id, entity_id, entity_type, object_key, name, type, extension, visibility)
SELECT uuid_generate_v4(),
       entity_id,
       entity_type,
       replace(image, 'https://storage.googleapis.com/akvo-unep-gpml/images', concat_ws('/', entity_type, 'images')) AS object_key,
       substring(image from 'images\/([a-zA-Z0-9_]+)\.') AS name,
       concat_ws('/', 'image',lower(substring(image FROM '\.([^\.]*)$'))) AS type,
       substring(image FROM '\.([^\.]*)$') AS extension,
       (CASE WHEN entity_type = 'organisation' THEN 'private' ELSE 'public' END)::FILE_VISIBILITY AS visibility
FROM entity_images
WHERE image ilike 'https://storage.googleapis.com%'
      -- The following takes care of both NULLs and empty string with
      -- or without spaces.
      AND coalesce(TRIM(image), '') != '';
--;;
WITH entity_thumbnails AS (
	SELECT id AS entity_id, 'event' AS entity_type, thumbnail
	FROM event
	UNION
	SELECT id AS entity_id, 'policy' AS entity_type, thumbnail
	FROM policy
	UNION
	SELECT id AS entity_id, 'initiative' AS entity_type, thumbnail
	FROM initiative
	UNION
	SELECT id AS entity_id, 'resource' AS entity_type, thumbnail
	FROM resource
	UNION
	SELECT id AS entity_id, 'technology' AS entity_type, thumbnail
	FROM technology
	UNION
	SELECT id AS entity_id, 'case_study' AS entity_type, thumbnail
	FROM case_study
)
-- Just the thumbnails that were previously in GCS.
INSERT INTO temp_entity_thumbnails (id, entity_id, entity_type, object_key, name, type, extension, visibility)
SELECT uuid_generate_v4(),
       entity_id,
       entity_type,
       replace(thumbnail, 'https://storage.googleapis.com/akvo-unep-gpml/images', concat_ws('/', entity_type, 'images')) AS object_key,
       substring(thumbnail from 'images\/([a-zA-Z0-9_]+)\.') AS name,
       concat_ws('/', 'image',lower(substring(thumbnail FROM '\.([^\.]*)$'))) AS type,
       substring(thumbnail FROM '\.([^\.]*)$') AS extension,
       'public' AS visibility
FROM entity_thumbnails
WHERE thumbnail ilike 'https://storage.googleapis.com%'
      -- The following takes care of both NULLs and empty string with
      -- or without spaces.
      AND coalesce(TRIM(thumbnail), '') != '';
--;;
-- Insert all the new records into the File table and update the
-- foreign keys in the entity tables to point to their files.
INSERT INTO file (id, object_key, name, type, extension, visibility)
SELECT id, object_key, name, type, extension, visibility
FROM temp_entity_images;
--;;
INSERT INTO file (id, object_key, name, type, extension, visibility)
SELECT id, object_key, name, type, extension, visibility
FROM temp_entity_thumbnails;
--;;
UPDATE organisation SET logo_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = organisation.id AND tmp.entity_type = 'organisation';
--;;
UPDATE event SET image_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = event.id AND tmp.entity_type = 'event';
--;;
UPDATE event SET thumbnail_id = tmp.id
FROM temp_entity_thumbnails tmp
WHERE tmp.entity_id = event.id AND tmp.entity_type = 'event';
--;;
UPDATE technology SET image_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = technology.id AND tmp.entity_type = 'technology';
--;;
UPDATE technology SET thumbnail_id = tmp.id
FROM temp_entity_thumbnails tmp
WHERE tmp.entity_id = technology.id AND tmp.entity_type = 'technology';
--;;
UPDATE policy SET image_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = policy.id AND tmp.entity_type = 'policy';
--;;
UPDATE policy SET thumbnail_id = tmp.id
FROM temp_entity_thumbnails tmp
WHERE tmp.entity_id = policy.id AND tmp.entity_type = 'policy';
--;;
UPDATE initiative SET image_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = initiative.id AND tmp.entity_type = 'initiative';
--;;
UPDATE initiative SET thumbnail_id = tmp.id
FROM temp_entity_thumbnails tmp
WHERE tmp.entity_id = initiative.id AND tmp.entity_type = 'initiative';
--;;
UPDATE case_study SET image_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = case_study.id AND tmp.entity_type = 'case_study';
--;;
UPDATE case_study SET thumbnail_id = tmp.id
FROM temp_entity_thumbnails tmp
WHERE tmp.entity_id = case_study.id AND tmp.entity_type = 'case_study';
--;;
UPDATE resource SET image_id = tmp.id
FROM temp_entity_images tmp
WHERE tmp.entity_id = resource.id AND tmp.entity_type = 'resource';
--;;
UPDATE resource SET thumbnail_id = tmp.id
FROM temp_entity_thumbnails tmp
WHERE tmp.entity_id = resource.id AND tmp.entity_type = 'resource';
--;;
-- Drop the temporary tables as they fulfilled their purpose.
DROP TABLE temp_entity_images;
DROP TABLE temp_entity_thumbnails;
--;;
COMMIT;
