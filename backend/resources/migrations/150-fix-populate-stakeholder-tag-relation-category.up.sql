BEGIN;
--;;
UPDATE stakeholder_tag SET tag_relation_category = 'seeking'
FROM tag
WHERE stakeholder_tag.tag = tag.id
AND tag.tag_category = 1
AND stakeholder_tag.tag_relation_category IS NULL;
--;;
UPDATE stakeholder_tag SET tag_relation_category = 'offering'
FROM tag
WHERE stakeholder_tag.tag = tag.id
AND tag.tag_category = 10
AND stakeholder_tag.tag_relation_category IS NULL;
--;;
COMMIT;
