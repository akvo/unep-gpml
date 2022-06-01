BEGIN;
--;;
ALTER TABLE stakeholder_event
ADD COLUMN is_bookmark BOOLEAN DEFAULT false;
--;;
ALTER TABLE stakeholder_initiative
ADD COLUMN is_bookmark BOOLEAN DEFAULT false;
--;;
ALTER TABLE stakeholder_resource
ADD COLUMN is_bookmark BOOLEAN DEFAULT false;
--;;
ALTER TABLE stakeholder_policy
ADD COLUMN is_bookmark BOOLEAN DEFAULT false;
--;;
ALTER TABLE stakeholder_technology
ADD COLUMN is_bookmark BOOLEAN DEFAULT false;
--;;
UPDATE stakeholder_event SET is_bookmark = false;
--;;
UPDATE stakeholder_event SET is_bookmark = true WHERE association= 'interested in';
--;;
UPDATE stakeholder_initiative SET is_bookmark = false;
--;;
UPDATE stakeholder_initiative SET is_bookmark = true WHERE association = 'interested in';
--;;
UPDATE stakeholder_resource SET is_bookmark = false;
--;;
UPDATE stakeholder_resource SET is_bookmark = true WHERE association = 'interested in';
--;;
UPDATE stakeholder_policy SET is_bookmark = false;
--;;
UPDATE stakeholder_policy SET is_bookmark = true WHERE association = 'interested in';
--;;
UPDATE stakeholder_technology SET is_bookmark = false;
--;;
UPDATE stakeholder_technology SET is_bookmark = true WHERE association = 'interested in';
--;;
ALTER TABLE stakeholder_event
ALTER COLUMN is_bookmark SET NOT NULL;
--;;
ALTER TABLE stakeholder_initiative
ALTER COLUMN is_bookmark SET NOT NULL;
--;;
ALTER TABLE stakeholder_resource
ALTER COLUMN is_bookmark SET NOT NULL;
--;;
ALTER TABLE stakeholder_policy
ALTER COLUMN is_bookmark SET NOT NULL;
--;;
ALTER TABLE stakeholder_technology
ALTER COLUMN is_bookmark SET NOT NULL;
--;;
COMMIT;