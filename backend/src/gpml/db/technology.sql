-- :name new-technology :<!
-- :doc Insert a new policies
insert into technology(name, year_founded, country, organisation_type, development_stage, specifications_provided, email, geo_coverage_type, attachments, remarks)
values(:name, :year_founded, :country, :organisation_type, :development_stage, :v:specifications_provided::boolean, :email, :v:geo_coverage_type::geo_coverage_type, :v:attachments::text[], :remarks) returning id;
