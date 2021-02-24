-- :name new-technology :<! :1
-- :doc Insert a new policies
insert into technology(name, year_founded, country, organisation_type, development_stage, specifications_provided, email, geo_coverage_type, attachments, remarks, review_status, url, image, logo)
values(:name, :year_founded, :country, :organisation_type, :development_stage, :v:specifications_provided::boolean, :email, :v:geo_coverage_type::geo_coverage_type, :v:attachments::text[], :remarks, :v:review_status::review_status, :url, :image, :logo) returning id;
