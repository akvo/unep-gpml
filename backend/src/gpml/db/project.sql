----------------------DEPRECATED------------------------------
-- :name new-project :<! :1
-- :doc Insert a new projects
insert into project(
    uuid,
    phase,
    contribution,
    funds,
    title,
    summary,
    url,
    geo_coverage_type,
    review_status,
    image
--~ (when (contains? params :id) ", id")
)
values(
    :uuid,
    :phase,
    :contribution,
    :funds,
    :title,
    :summary,
    :url,
    :v:geo_coverage_type::geo_coverage_type,
    :v:review_status::review_status,
    :image
--~ (when (contains? params :id) ", :id")
)
returning id;

-- :name project-actions-id :? :*
select action from project_action where project = :id

-- :name project-actions-details :? :*
select action_detail,value from project_action_detail where project = :id
----------------------END OF DEPRECATED CODE------------------------------

-- :name get-projects :query :many
-- :doc Get projects with filters.
SELECT p.*,
array_remove(array_agg(pgc.country_id), NULL) AS geo_coverage_countries,
array_remove(array_agg(pgc.country_group_id), NULL) AS geo_coverage_country_groups
FROM project p
LEFT JOIN project_geo_coverage pgc ON p.id = pgc.project_id AND p.geo_coverage_type != 'global'
WHERE 1=1
--~ (when (get-in params [:filters :ids]) " AND p.id = ANY(:filters.ids)")
--~ (when (get-in params [:filters :geo_coverage_types]) " AND p.geo_coverage_type = ANY(:filters.geo_coverage_types)")
--~ (when (get-in params [:filters :types]) " AND p.type = ANY(:filters.types)")
--~ (when (get-in params [:filters :stakeholders_ids]) " AND p.stakeholder_id IN (:v*:filters.stakeholders_ids)")
--~ (when (get-in params [:filters :countries]) " AND pgc.country_id IN (:v*:filters.countries)")
--~ (when (get-in params [:filters :country_groups]) " AND pgc.country_group_id IN (:v*:filters.country_groups)")
GROUP BY p.id

-- :name create-projects :execute :affected
INSERT INTO project (:i*:insert-cols)
VALUES :t*:insert-values;

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
