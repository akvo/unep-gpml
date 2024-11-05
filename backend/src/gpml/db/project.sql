-- :name new-project :returning-execute :one
-- :doc Insert a new projects
INSERT INTO project(
    title,
    start_date,
    end_date,
    summary,
    publish_year,
    valid_from,
    valid_to,
    geo_coverage_type,
    language
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :url) ", url")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :capacity_building) ", capacity_building")
--~ (when (contains? params :source) ", source")
--~ (when (contains? params :videos) ", videos")
--~ (when (contains? params :background) ", background")
--~ (when (contains? params :purpose) ", purpose")
--~ (when (contains? params :highlights) ", highlights")
--~ (when (contains? params :outcomes) ", outcomes")
--~ (when (contains? params :image_id) ", image_id")
--~ (when (contains? params :thumbnail_id) ", thumbnail_id")
)
VALUES(
    :title,
    :start_date::timestamptz,
    :end_date::timestamptz,
    :summary,
    :publish_year,
    :valid_from,
    :valid_to,
    :v:geo_coverage_type::geo_coverage_type,
    :language
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :capacity_building) ", :capacity_building")
--~ (when (contains? params :source) ", :source")
--~ (when (contains? params :videos) ", :v:videos::jsonb")
--~ (when (contains? params :background) ", :background")
--~ (when (contains? params :purpose) ", :purpose")
--~ (when (contains? params :highlights) ", :v:highlights::jsonb")
--~ (when (contains? params :outcomes) ", :v:outcomes::jsonb")
--~ (when (contains? params :image_id) ", :image_id")
--~ (when (contains? params :thumbnail_id) ", :thumbnail_id")
)
returning id;

-- :name create-project-gallery :insert-returning :many
-- :doc Creates a relation for project to image file.
INSERT INTO project_gallery (project, image)
VALUES :t*:images RETURNING *;

----------------------DEPRECATED------------------------------
-- :name project-actions-id :? :*
select action from project_action where project = :id

-- :name project-actions-details :? :*
select action_detail,value from project_action_detail where project = :id

-- :name get-projects :query :many
-- :doc Get projects with filters.
SELECT p.*,
array_remove(array_agg(pgc.country), NULL) AS geo_coverage_countries,
array_remove(array_agg(pgc.country_group), NULL) AS geo_coverage_country_groups,
array_remove(array_agg(pgc.country_state), NULL) AS geo_coverage_country_states
FROM project p
LEFT JOIN project_geo_coverage pgc ON p.id = pgc.project AND p.geo_coverage_type != 'global'
WHERE 1=1
--~ (when (get-in params [:filters :ids]) " AND p.id = ANY(:filters.ids)")
--~ (when (get-in params [:filters :geo_coverage_types]) " AND p.geo_coverage_type = ANY(:filters.geo_coverage_types)")
--~ (when (get-in params [:filters :types]) " AND p.type = ANY(:filters.types)")
--~ (when (get-in params [:filters :stakeholders_ids]) " AND p.stakeholder_id IN (:v*:filters.stakeholders_ids)")
--~ (when (get-in params [:filters :countries]) " AND pgc.country IN (:v*:filters.countries)")
--~ (when (get-in params [:filters :country_groups]) " AND pgc.country_group IN (:v*:filters.country_groups)")
--~ (when (get-in params [:filters :stages]) " AND p.stage = ANY(:filters.stages)")
GROUP BY p.id

-- :name create-projects :returning-execute :many
INSERT INTO project (:i*:insert-cols)
VALUES :t*:insert-values RETURNING id;

-- :name update-project :execute :affected
/* :require [clojure.string :as string]
[hugsql.parameters :refer [identifier-param-quote]] */
UPDATE project SET
/*~
(string/join ","
(for [[field _] (:updates params)]
(str (identifier-param-quote (name field) options)
" = :v:updates." (name field))))
~*/
where id = :id;

-- :name delete-projects :execute :affected
DELETE FROM project
WHERE id = ANY(:filters.ids);
----------------------END OF DEPRECATED CODE------------------------------
