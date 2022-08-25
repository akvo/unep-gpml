BEGIN;
--;;
-- Add new property capacity building for those resources that
-- don't have it.
ALTER TABLE initiative
ADD COLUMN capacity_building BOOLEAN NOT NULL DEFAULT FALSE;
--;;
ALTER TABLE policy
ADD COLUMN capacity_building BOOLEAN NOT NULL DEFAULT FALSE;
--;;
ALTER TABLE technology
ADD COLUMN capacity_building BOOLEAN NOT NULL DEFAULT FALSE;
--;;
-- Update existing resources that have the `capacity building` tag to
-- have the `capacity_buidling` flag set to `true`.
UPDATE resource r
SET capacity_building = TRUE
FROM resource_tag rt
JOIN tag t ON t.id = rt.tag
WHERE r.id = rt.resource AND t.tag = 'capacity building';
--;;
UPDATE policy p
SET capacity_building = TRUE
FROM policy_tag pt
JOIN tag t ON t.id = pt.tag
WHERE p.id = pt.policy AND t.tag = 'capacity building';
--;;
UPDATE initiative i
SET capacity_building = TRUE
FROM initiative_tag it
JOIN tag t ON t.id = it.tag
WHERE i.id = it.initiative AND t.tag = 'capacity building';
--;;
UPDATE technology te
SET capacity_building = TRUE
FROM technology_tag tt
JOIN tag t ON t.id = tt.tag
WHERE te.id = tt.technology AND t.tag = 'capacity building';
--;;
UPDATE event e
SET capacity_building = TRUE
FROM event_tag et
JOIN tag t ON t.id = et.tag
WHERE e.id = et.event AND t.tag = 'capacity building';
--;;
COMMIT;
