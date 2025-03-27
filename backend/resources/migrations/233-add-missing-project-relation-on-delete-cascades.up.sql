BEGIN;
--;;
ALTER TABLE organisation_project
DROP CONSTRAINT organisation_project_organisation_fkey,
DROP CONSTRAINT organisation_project_project_fkey,
ADD CONSTRAINT organisation_project_organisation_fkey FOREIGN KEY (organisation) REFERENCES organisation (id) ON DELETE CASCADE,
ADD CONSTRAINT organisation_project_project_fkey FOREIGN KEY (project) REFERENCES project (id) ON DELETE CASCADE;
--;;
ALTER TABLE stakeholder_project
DROP CONSTRAINT stakeholder_project_stakeholder_fkey,
DROP CONSTRAINT stakeholder_project_project_fkey,
ADD CONSTRAINT stakeholder_project_stakeholder_fkey FOREIGN KEY (stakeholder) REFERENCES stakeholder (id) ON DELETE CASCADE,
ADD CONSTRAINT stakeholder_project_project_fkey FOREIGN KEY (project) REFERENCES project (id) ON DELETE CASCADE;
--;;
ALTER TABLE project_language_url
DROP CONSTRAINT project_language_url_language_fkey,
DROP CONSTRAINT project_language_url_project_fkey,
ADD CONSTRAINT project_language_url_language_fkey FOREIGN KEY (language) REFERENCES language (id) ON DELETE CASCADE,
ADD CONSTRAINT project_language_url_project_fkey FOREIGN KEY (project) REFERENCES project (id) ON DELETE CASCADE;
--;;
COMMIT;
