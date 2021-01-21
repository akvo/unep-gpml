-- :name new-policy :<!
-- :doc Insert a new policies
insert into policy(title, original_title, data_source, country, abstract, type_of_law, record_number, implementing_mea, first_publication_date, latest_amendment_date, status, geo_coverage_type, attachments, remarks)
values(:title, :original_title, :data_source, :country, :abstract, :type_of_law, :record_number, :implementing_mea, :v:first_publication_date::timestamptz, :v:latest_amendment_date::timestamptz, :status, :v:geo_coverage_type::geo_coverage_type, :v:attachments::text[], :remarks) returning id;
