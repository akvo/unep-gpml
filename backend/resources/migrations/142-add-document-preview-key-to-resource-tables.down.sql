BEGIN;
--;;
ALTER TABLE resource
DROP COLUMN document_preview;
--;;
ALTER TABLE event
DROP COLUMN document_preview;
--;;
ALTER TABLE initiatve
DROP COLUMN document_preview;
--;;
ALTER TABLE policy
DROP COLUMN document_preview;
--;;
ALTER TABLE technology
DROP COLUMN document_preview;
--;;
COMMIT;
