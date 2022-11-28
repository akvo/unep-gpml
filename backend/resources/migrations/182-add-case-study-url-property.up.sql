BEGIN;
--;;
ALTER TABLE case_study
ADD COLUMN url TEXT;
--;;
COMMIT;
