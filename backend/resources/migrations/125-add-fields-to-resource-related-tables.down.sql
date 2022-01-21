ALTER TABLE resource
DROP COLUMN related_content,
DROP COLUMN first_publication_date,
DROP COLUMN latest_amendment_date;
--;;
ALTER TABLE event
DROP COLUMN related_content;
--;;
ALTER TABLE initiative
DROP COLUMN related_content;
--;;
ALTER TABLE technology
DROP COLUMN info_docs,
DROP COLUMN sub_content_type,
DROP COLUMN related_content;
--;;
ALTER TABLE policy
DROP COLUMN related_content,
DROP COLUMN topics;
