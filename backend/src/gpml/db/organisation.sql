-- :name all-organisation :? :*
-- :doc Get all organisations
select id, name from organisation order by id

-- :name all-public-entities :? :*
-- :doc Get all member organisations
SELECT o.*, jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL) AS files
FROM organisation o
LEFT JOIN file f ON o.logo_id = f.id
WHERE is_member = true
--~ (when (:review-status params) "AND review_status = (:v:review-status)::review_status")
GROUP BY o.id
ORDER BY o.id;

-- :name all-public-non-member-entities :? :*
-- :doc Get all non member organisations
SELECT o.*, jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL) AS files
FROM organisation o
LEFT JOIN file f ON o.logo_id = f.id
WHERE is_member = false
--~ (when (:review-status params) "AND review_status = (:v:review-status)::review_status")
GROUP BY o.id
ORDER BY o.id;

-- :name all-members :? :*
-- :doc Get all member organisations
select id, name from organisation
where is_member = true
and review_status = 'APPROVED'
order by id

-- :name all-non-members :? :*
-- :doc Get all non member organisations
select id, name
from organisation
where is_member = false
and review_status = 'APPROVED'
order by id


-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select *
from organisation
where id = :id;

-- :name organisation-by-name :? :1
-- :doc Get organisation by name
select id from organisation where lower(name) = lower(:name)

-- :name organisation-by-names :? :*
-- :doc Get organisation by names
select * from organisation where name in (:v*:names)

-- :name new-organisation :<! :1
insert into organisation (
    name
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :type) ", type")
--~ (when (contains? params :representative_group_government) ", representative_group_government")
--~ (when (contains? params :representative_group_private_sector) ", representative_group_private_sector")
--~ (when (contains? params :representative_group_academia_research) ", representative_group_academia_research")
--~ (when (contains? params :representative_group_civil_society) ", representative_group_civil_society")
--~ (when (contains? params :representative_group_other) ", representative_group_other")
--~ (when (contains? params :subnational_area) ", subnational_area")
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :geo_coverage_type) ", geo_coverage_type")
--~ (when (contains? params :url) ", url")
--~ (when (contains? params :program) ", program")
--~ (when (contains? params :contribution) ", contribution")
--~ (when (contains? params :expertise) ", expertise")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :second_contact) ", second_contact")
--~ (when (contains? params :review_status) ", review_status")
--~ (when (contains? params :is_member) ", is_member")
--~ (when (contains? params :logo_id) ", logo_id")
)
values (
    :name
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :type) ", :type")
--~ (when (contains? params :representative_group_government) ", :representative_group_government")
--~ (when (contains? params :representative_group_private_sector) ", :representative_group_private_sector")
--~ (when (contains? params :representative_group_academia_research) ", :representative_group_academia_research")
--~ (when (contains? params :representative_group_civil_society) ", :representative_group_civil_society")
--~ (when (contains? params :representative_group_other) ", :representative_group_other")
--~ (when (contains? params :subnational_area) ", :subnational_area")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :geo_coverage_type) ", :geo_coverage_type::geo_coverage_type")
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :program) ", :program")
--~ (when (contains? params :contribution) ", :contribution")
--~ (when (contains? params :expertise) ", :expertise")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :second_contact) ", :second_contact")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
--~ (when (contains? params :is_member) ", :is_member")
--~ (when (contains? params :logo_id) ", :logo_id")
) returning id;

-- :name update-organisation :execute :affected
UPDATE organisation
SET
/*~
(str/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :updates." (name field))))
~*/
WHERE id = :id;

-- :name geo-coverage-v2 :? :*
-- :doc Get geo coverage by organisation id
select id, country, country_group from organisation_geo_coverage where organisation = :id

-- :name add-geo-coverage :<! :1
-- :doc add organisation geo coverage
insert into organisation_geo_coverage(organisation, country_group, country)
values :t*:geo RETURNING id;

-- :name delete-geo-coverage :! :n
-- :doc remove geo coverage
delete from organisation_geo_coverage where organisation = :id

-- :name add-organisation-tags :<! :1
-- :doc add organisation tags
insert into organisation_tag(organisation, tag)
values :t*:tags RETURNING id;

-- :name delete-organisation-tags :! :n
-- :doc remove organisation-tags
delete from organisation_tag where organisation = :id

-- :name delete-organisation :!
-- :doc Deletes an organisation
DELETE FROM organisation WHERE id = :id;

-- :name get-organisations
-- :doc Gets all organisations. It accepts filters and can be extend to support more
SELECT * FROM organisation
WHERE 1=1
--~(when (get-in params [:filters :id]) " AND :filters.id = id")
--~(when (get-in params [:filters :name]) " AND LOWER(:filters.name) = LOWER(name)")
--~(when (true? (get-in params [:filters :is_member])) " AND is_member IS TRUE")
--~(when (false? (get-in params [:filters :is_member])) " AND is_member IS FALSE")

-- :name get-organisation-files-to-migrate
SELECT id, 'logo' AS file_type, 'images' AS file_key, logo AS content
FROM organisation
WHERE logo NOT LIKE 'https://storage.googleapis.com/%'
AND logo IS NOT NULL
AND logo_id IS NULL
ORDER BY created
--~ (when (:limit params) " LIMIT :limit")
;
