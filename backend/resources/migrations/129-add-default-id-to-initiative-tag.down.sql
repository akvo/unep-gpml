ALTER TABLE initiative_tag
DROP CONSTRAINT initiative_tag_pk;
--;;
ALTER TABLE initiative_tag
ALTER COLUMN id
DROP DEFAULT;
--;;
DROP SEQUENCE initiative_tag_id_seq;
