-- :name create-project-geo-coverage :execute :affected
INSERT INTO project_geo_coverage (:i*:insert-cols)
VALUES :t*:insert-values;

-- :name delete-project-geo-coverage :execute :affected
DELETE FROM project_geo_coverage
WHERE project_id = :project-id;
