-- :name new-resource :<! :1
-- :doc Insert a new resource
insert into resource(title, type, publish_year, summary, value, image, valid_from, valid_to, geo_coverage_type, attachments, remarks)
values(:title, :type, :publish_year, :summary, :value, :image, :valid_from, :valid_to, :v:geo_coverage_type::geo_coverage_type, :v:attachments::text[], :remarks) returning id;
