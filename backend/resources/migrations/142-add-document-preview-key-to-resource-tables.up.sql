BEGIN;
--;;
ALTER TABLE resource
ADD COLUMN document_preview BOOLEAN
DEFAULT FALSE;
--;;
ALTER TABLE event
ADD COLUMN document_preview BOOLEAN
DEFAULT FALSE;
--;;
ALTER TABLE initiative
ADD COLUMN document_preview BOOLEAN
DEFAULT FALSE;
--;;
ALTER TABLE policy
ADD COLUMN document_preview BOOLEAN
DEFAULT FALSE;
--;;
ALTER TABLE technology
ADD COLUMN document_preview BOOLEAN
DEFAULT FALSE;
--;;
COMMIT;
