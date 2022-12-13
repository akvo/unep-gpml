BEGIN;
--;;
CREATE SEQUENCE comment_id_seq AS INTEGER OWNED BY comment.id;
--;;
ALTER TABLE comment
ADD COLUMN id_old UUID,
ADD COLUMN parent_id_new INTEGER;
--;;
UPDATE comment set id_old = id;
--;;
ALTER TABLE comment
DROP CONSTRAINT comment_parent_id_fkey;
--;;
ALTER TABLE comment
ALTER COLUMN id SET DATA TYPE INTEGER USING nextval('comment_id_seq');
--;;
UPDATE comment c1
SET parent_id_new = c2.id
FROM comment c2
WHERE c1.parent_id = c2.id_old;
--;;
ALTER TABLE comment
DROP COLUMN parent_id,
DROP COLUMN id_old;
--;;
ALTER TABLE comment
RENAME COLUMN parent_id_new TO parent_id;
--;;
ALTER TABLE comment
ALTER COLUMN id SET DEFAULT nextval('comment_id_seq');
--;;
ALTER TABLE comment
ADD CONSTRAINT comment_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE ON UPDATE CASCADE;
--;;
COMMIT;