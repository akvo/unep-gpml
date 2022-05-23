BEGIN;
--;;
UPDATE stakeholder_tag SET tag_relation_category = NULL
FROM tag
WHERE stakeholder_tag.tag = tag.id
AND tag.tag_category = 1;
--;;
UPDATE stakeholder_tag SET tag_relation_category = NULL
FROM tag
WHERE stakeholder_tag.tag = tag.id
AND tag.tag_category = 10;
--;;
COMMIT;
