-- A :result value of :n below will return affected row count:
-- :name new-resource :! :n
-- :doc Insert a new resource
insert into resource(title, type, publish_year, summary, value, image, valid_from, valid_to, geo_coverage_type, attachments, remarks)
values(:title, :type, :publish_year, :summary, :value, :image, :valid_from, :valid_to, :geo_coverage_type, :attachments, :remarks)
