BEGIN;
--;;
ALTER TABLE stakeholder
    DROP CONSTRAINT stakeholder_affiliation_fkey;
--;;
ALTER TABLE stakeholder
    ADD CONSTRAINT stakeholder_affiliation_fkey FOREIGN KEY (affiliation) REFERENCES organisation (id);
--;;
COMMIT;
