BEGIN;
--;;
UPDATE stakeholder SET picture = NULL
WHERE picture ILIKE '%ui-avatars.com%' OR picture ILIKE '%s.gravatar.com%';
--;;
COMMIT;