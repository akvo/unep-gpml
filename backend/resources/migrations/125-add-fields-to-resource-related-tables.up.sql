ALTER TABLE resource
ADD COLUMN related_content INTEGER[],
ADD COLUMN first_publication_date TEXT,
ADD COLUMN latest_amendment_date TEXT;
--;;
ALTER TABLE event
ADD COLUMN related_content INTEGER[];
--;;
ALTER TABLE initiative
ADD COLUMN related_content INTEGER[];
--;;
ALTER TABLE technology
ADD COLUMN info_docs TEXT,
ADD COLUMN sub_content_type TEXT,
ADD COLUMN related_content INTEGER[];
--;;
ALTER TABLE policy
ADD COLUMN related_content INTEGER[],
ADD COLUMN topics TEXT[];
