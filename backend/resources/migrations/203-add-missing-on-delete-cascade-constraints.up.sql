BEGIN;
--;;
ALTER TABLE resource_organisation
DROP CONSTRAINT resource_organisation_organisation_fkey,
DROP CONSTRAINT resource_organisation_resource_fkey,
ADD CONSTRAINT resource_organisation_organisation_fkey FOREIGN KEY (organisation) REFERENCES organisation (id) ON DELETE CASCADE,
ADD CONSTRAINT resource_organisation_resource_fkey FOREIGN KEY (resource) REFERENCES resource(id) ON DELETE CASCADE;
--;;
ALTER TABLE resource_language_url
DROP CONSTRAINT resource_language_url_language_fkey,
DROP CONSTRAINT resource_language_url_resource_fkey,
ADD CONSTRAINT resource_language_url_language_fkey FOREIGN KEY (language) REFERENCES language(id) ON DELETE CASCADE,
ADD CONSTRAINT resource_language_url_resource_fkey FOREIGN KEY (resource) REFERENCES resource(id) ON DELETE CASCADE;
--;;
ALTER TABLE event_language_url
DROP CONSTRAINT event_language_url_language_fkey,
DROP CONSTRAINT event_language_url_event_fkey,
ADD CONSTRAINT event_language_url_language_fkey FOREIGN KEY (language) REFERENCES language(id) ON DELETE CASCADE,
ADD CONSTRAINT event_language_url_event_fkey FOREIGN KEY (event) REFERENCES event(id) ON DELETE CASCADE;
--;;
ALTER TABLE technology_language_url
DROP CONSTRAINT technology_language_url_language_fkey,
DROP CONSTRAINT technology_language_url_technology_fkey,
ADD CONSTRAINT technology_language_url_language_fkey FOREIGN KEY (language) REFERENCES language(id) ON DELETE CASCADE,
ADD CONSTRAINT technology_language_url_technology_fkey FOREIGN KEY (technology) REFERENCES technology(id) ON DELETE CASCADE;
--;;
COMMIT;

