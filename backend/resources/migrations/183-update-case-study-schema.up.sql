BEGIN;
--;;
ALTER TABLE case_study
ADD COLUMN challenge_and_solution TEXT,
ADD COLUMN external_link TEXT;
--;;
ALTER TABLE case_study
ALTER COLUMN created_by DROP NOT NULL;
--;;
COMMIT;
