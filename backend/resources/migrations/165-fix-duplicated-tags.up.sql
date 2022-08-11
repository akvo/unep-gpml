BEGIN;
--;;
--;; 1. Remove rejected tags as they are not needed and simplify this process.
DELETE FROM tag WHERE review_status = 'REJECTED';
--;;
--;; 2. Change duplicate tags refs that don't have any approved tag as reference to get rid of that case
--;; (it could happen from Leap API or because a user has typed his own tag duplicating it, but it has not been
--;; approved yet).
--;;
--;; Delete the view in case it existed already (should not happen but as a safety system).
DROP VIEW IF EXISTS duplicated_tags_for_review;
--;; Find duplicate tags given all of them need to be under SUBMITTED status (REJECTED ones have been deleted previously)
CREATE VIEW duplicated_tags_for_review AS (
  SELECT MIN(id) AS original_id,
         ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM tag
    GROUP BY LOWER(tag)
    HAVING COUNT(LOWER(tag)) > 1
           AND
           NOT ('APPROVED' = ANY(ARRAY_AGG(review_status)))
);
--;; Find duplicate tags given some of them need could be under SUBMITTED status but at least there is one tag there as
--;; APPROVED, which will be used as reference to update duplicates.
DROP VIEW IF EXISTS duplicated_tags;
CREATE VIEW duplicated_tags AS (
  SELECT MIN(id) FILTER (WHERE review_status = 'APPROVED') AS original_id,
         ARRAY_REMOVE(ARRAY_AGG(id), MIN(id) FILTER (WHERE review_status = 'APPROVED')) AS duplicate_ids
    FROM tag
    GROUP BY LOWER(tag)
    HAVING COUNT(LOWER(tag)) > 1
           AND
           'APPROVED' = ANY(ARRAY_AGG(review_status))
);
--;; This part is related to updating tag relationships that had duplicate tag references that are none approved.
--;; The idea here is to move the references to use the tag with lowest id as the referenced tag id for all the tables
--;; with relationships between tags and entities.
UPDATE stakeholder_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE stakeholder_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE organisation_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE organisation_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE event_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE event_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE initiative_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE initiative_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE policy_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE policy_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE resource_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE resource_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE technology_tag
  SET tag = dtags.original_id
  FROM duplicated_tags_for_review dtags
  WHERE technology_tag.tag = ANY(dtags.duplicate_ids);
--;;
--;; 3. Get rid of duplicates moving references to the min id one that is APPROVED (for the cases where at least
--;; there is one APPROVED tag duplicated used as reference.
UPDATE stakeholder_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE stakeholder_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE organisation_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE organisation_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE event_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE event_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE initiative_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE initiative_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE policy_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE policy_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE resource_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE resource_tag.tag = ANY(dtags.duplicate_ids);
--;;
UPDATE technology_tag
  SET tag = dtags.original_id
  FROM duplicated_tags dtags
  WHERE technology_tag.tag = ANY(dtags.duplicate_ids);
--;;
--;; 4. Remove duplicate records in stakeholder tag and the rest. This can be due to duplicate tags or not.
--;; Remove duplicate stakeholder_tag rows
--;;
WITH duplicated_stakeholder_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM stakeholder_tag
    GROUP BY (stakeholder, tag, LOWER(tag_relation_category))
    HAVING COUNT(tag) > 1
)
DELETE FROM stakeholder_tag st
  USING duplicated_stakeholder_tags_cte dstags
  WHERE st.id = ANY(dstags.duplicate_ids);
--;;
--;; Remove duplicate organisation_tag rows
--;;
WITH duplicated_org_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM organisation_tag
    GROUP BY (organisation, tag)
    HAVING COUNT(tag) > 1
)
DELETE FROM organisation_tag ot
  USING duplicated_org_tags_cte dotags
  WHERE ot.id = ANY(dotags.duplicate_ids);
--;;
--;; Remove duplicate event_tag rows
--;;
WITH duplicated_event_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM event_tag
    GROUP BY (event, tag)
    HAVING COUNT(tag) > 1
)
DELETE FROM event_tag et
  USING duplicated_event_tags_cte detags
  WHERE et.id = ANY(detags.duplicate_ids);
--;;
--;; Remove duplicate initiative_tag rows
--;;
WITH duplicated_init_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM initiative_tag
    GROUP BY (initiative, tag)
    HAVING COUNT(tag) > 1
)
DELETE FROM initiative_tag it
  USING duplicated_init_tags_cte ditags
  WHERE it.id = ANY(ditags.duplicate_ids);
--;;
--;; Remove duplicate policy_tag rows
--;;
WITH duplicated_pol_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM policy_tag
    GROUP BY (policy, tag)
    HAVING COUNT(tag) > 1
)
DELETE FROM policy_tag pt
  USING duplicated_pol_tags_cte dptags
  WHERE pt.id = ANY(dptags.duplicate_ids);
--;;
--;; Remove duplicate resource_tag rows
--;;
WITH duplicated_res_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM resource_tag
    GROUP BY (resource, tag)
    HAVING COUNT(tag) > 1
)
DELETE FROM resource_tag rt
  USING duplicated_res_tags_cte drtags
  WHERE rt.id = ANY(drtags.duplicate_ids);
--;;
--;; Remove duplicate technology_tag rows
--;;
WITH duplicated_tech_tags_cte AS (
  SELECT ARRAY_REMOVE(ARRAY_AGG(id), MIN(id)) AS duplicate_ids
    FROM technology_tag
    GROUP BY (technology, tag)
    HAVING COUNT(tag) > 1
)
DELETE FROM technology_tag tt
  USING duplicated_tech_tags_cte dttags
  WHERE tt.id = ANY(dttags.duplicate_ids);
--;;
--;; 5. Erase duplicated tags.
--;; Erase duplicated tags (looking for only non-approved tags), keeping the one with lowest id as the original one.
DELETE FROM tag t
  USING duplicated_tags_for_review dtags
  WHERE t.id = ANY(dtags.duplicate_ids);
--;;
--;; Erase duplicated tags (looking for one approved tag reference), keeping the approved one with lowest id as the
--;; original one.
DELETE FROM tag t
  USING duplicated_tags dtags
  WHERE t.id = ANY(dtags.duplicate_ids);
--;;
--;; Drop views now that will no longer be used.
DROP VIEW IF EXISTS duplicated_tags;
--;;
DROP VIEW IF EXISTS duplicated_tags_for_review;
--;;
--;; 6. Ensure we keep uniqueness in x_tag tables:
--;; We need to do it in this way to use LOWER function to build the index, as we cannot use an Expression creating
--;; a constraint.
CREATE UNIQUE INDEX IF NOT EXISTS stakeholder_tag_tag_rel_cat_unique
  ON stakeholder_tag (
    stakeholder,
    tag,
    LOWER(tag_relation_category));
--;;
ALTER TABLE IF EXISTS organisation_tag
  ADD CONSTRAINT organisation_tag_unique UNIQUE(organisation, tag);
--;;
ALTER TABLE IF EXISTS event_tag
  ADD CONSTRAINT event_tag_unique UNIQUE(event, tag);
--;;
ALTER TABLE IF EXISTS initiative_tag
  ADD CONSTRAINT initiative_tag_unique UNIQUE(initiative, tag);
--;;
ALTER TABLE IF EXISTS policy_tag
  ADD CONSTRAINT policy_tag_unique UNIQUE(policy, tag);
--;;
ALTER TABLE IF EXISTS resource_tag
  ADD CONSTRAINT resource_tag_unique UNIQUE(resource, tag);
--;;
ALTER TABLE IF EXISTS technology_tag
  ADD CONSTRAINT technology_tag_unique UNIQUE(technology, tag);
--;;
--;; 7. Ensure we keep uniqueness in tag table
--;; We need to do it in this way to use LOWER function to build the index, as we cannot use an
--;; Expression creating a constraint.
CREATE UNIQUE INDEX tag_unique ON tag (LOWER(tag));
--;;
COMMIT;