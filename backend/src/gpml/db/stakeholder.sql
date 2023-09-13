-- :name all-stakeholder :? :*
-- :doc Get all stakeholders
select * from stakeholder order by id;

-- :name all-public-stakeholders :? :*
-- :doc Get all stakeholders
select * from stakeholder
WHERE review_status = 'APPROVED'
order by id;

-- :name all-public-users :? :*
-- :doc Get all stakeholders
SELECT s.*, jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL) AS files
FROM stakeholder s
LEFT JOIN file f ON s.picture_id = f.id
--~ (when (:review-status params) "WHERE s.review_status = (:v:review-status)::review_status")
GROUP BY s.id
ORDER BY s.id;

-- :name list-stakeholder-paginated :? :*
-- :doc Get paginated list of stakeholders
SELECT * FROM stakeholder
WHERE 1=1
--~ (when (:review-status params) "AND review_status = (:v:review-status)::review_status")
--~ (when (seq (:roles params)) "AND role = ANY(ARRAY[:v*:roles]::stakeholder_role[])")
--~ (when (:email-like params) "AND email LIKE :v:email-like")
ORDER BY id
LIMIT :limit
OFFSET :limit * (:page - 1);

-- :name count-stakeholder :? :1
-- :doc Get paginated list of approved stakeholder
SELECT COUNT(*) FROM stakeholder
WHERE 1=1
--~ (when (:review-status params) "AND review_status = (:v:review-status)::review_status")
--~ (when (seq (:roles params)) "AND role = ANY(ARRAY[:v*:roles]::stakeholder_role[])")
--~ (when (:email-like params) "AND email LIKE :v:email-like")

-- :name get-stakeholder-by-id :? :1
-- :doc Get stakeholder by id
SELECT * FROM stakeholder
WHERE id = :id;

-- :name stakeholder-by-id :? :1
-- :doc Get stakeholder by id
select
    s.id,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.idp_usernames,
    s.public_email,
    s.public_database,
    s.linked_in,
    s.twitter,
    s.about,
    s.role,
    s.job_title,
    s.country,
    s.affiliation,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status,
    s.picture_id,
    s.cv_id
from stakeholder s
where s.id = :id;

-- :name stakeholder-by-email :? :1
-- :doc Get stakeholder by email
select
    s.id,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.idp_usernames,
    s.public_email,
    s.public_database,
    s.linked_in,
    s.twitter,
    s.about,
    s.role,
    s.job_title,
    s.country,
    s.affiliation,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status,
    s.picture_id,
    s.cv_id
from stakeholder s
where s.email = :email;

-- :name approved-stakeholder-by-email :? :1
-- :doc Get an stakeholder by email filtering by approved
select * from stakeholder where email = :email and review_status = 'APPROVED';

-- :name update-stakeholder-status :! :n
-- :doc Approve stakeholder
update stakeholder
set reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
where id = :id;

-- :name new-stakeholder :returning-execute :one
-- :doc Insert a new stakeholder
insert into stakeholder(
    first_name,
    last_name,
    email
--~ (when (contains? params :title) ", title")
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :idp_usernames) ", idp_usernames")
--~ (when (contains? params :affiliation) ",affiliation")
--~ (when (contains? params :linked_in) ",linked_in")
--~ (when (contains? params :twitter) ",twitter")
--~ (when (contains? params :about) ",about")
--~ (when (contains? params :organisation_role) ",organisation_role")
--~ (when (contains? params :public_email) ",public_email")
--~ (when (contains? params :public_database) ",public_database")
--~ (when (contains? params :job_title) ",job_title")
--~ (when (contains? params :id) ",id")
--~ (when (contains? params :picture_id) ", picture_id")
--~ (when (contains? params :cv_id) ",cv_id")
) values(
    :first_name,
    :last_name,
    :email
--~ (when (contains? params :title) ", :title")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :idp_usernames) ", :idp_usernames::jsonb")
--~ (when (contains? params :affiliation) ",:affiliation")
--~ (when (contains? params :linked_in) ",:linked_in")
--~ (when (contains? params :twitter) ",:twitter")
--~ (when (contains? params :about) ",:about")
--~ (when (contains? params :organisation_role) ",:organisation_role")
--~ (when (contains? params :public_email) ",:public_email")
--~ (when (contains? params :public_database) ",:public_database")
--~ (when (contains? params :job_title) ",:job_title")
--~ (when (contains? params :id) ",:id")
--~ (when (contains? params :picture_id) ", :picture_id")
--~ (when (contains? params :cv_id) ",:cv_id")
) RETURNING id;

-- :name update-stakeholder-role :! :n
-- :doc Update stakeholder role
update stakeholder
    set role = :v:role::stakeholder_role,
	modified = now(),
	reviewed_at = now()
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
--~ (when (contains? params :review_status) ",review_status = :v:review_status::review_status")
where id = :id;

-- :name update-stakeholder :execute :affected
-- :doc Update stakeholder column
update stakeholder set
--~ (when (contains? params :title) "title = :title,")
--~ (when (contains? params :first_name) "first_name= :first_name,")
--~ (when (contains? params :last_name) "last_name= :last_name,")
--~ (when (contains? params :affiliation) "affiliation= :v:affiliation::integer, ")
--~ (when (contains? params :linked_in) "linked_in= :linked_in,")
--~ (when (contains? params :twitter) "twitter= :twitter,")
--~ (when (contains? params :country) "country= :v:country::integer,")
--~ (when (contains? params :organisation_role) "organisation_role= :organisation_role,")
--~ (when (contains? params :geo_coverage_type) "geo_coverage_type= :v:geo_coverage_type::geo_coverage_type,")
--~ (when (contains? params :about) "about= :about,")
--~ (when (contains? params :public_email) "public_email= :public_email::boolean,")
--~ (when (contains? params :public_database) "public_database= :public_database::boolean,")
--~ (when (contains? params :job_title) "job_title= :job_title,")
--~ (when (contains? params :idp_usernames) "idp_usernames= :idp_usernames::jsonb,")
--~ (when (contains? params :picture_id) "picture_id= :picture_id,")
--~ (when (contains? params :cv_id) "cv_id= :cv_id, ")
--~ (when (contains? params :review_status) "review_status= :review_status::review_status,")
    modified = now()
where id = :id;

-- :name stakeholder-image-by-id :? :1
-- :doc Get Stakeholder image by id
select * from stakeholder_picture where id = :id

-- :name new-stakeholder-image :<! :1
-- :doc Insert new Stakeholder image
insert into stakeholder_picture (picture)
values(:picture) returning id;

-- :name stakeholder-cv-by-id :? :1
-- :doc Get Stakeholder cv by id
select * from stakeholder_cv where id = :id

-- :name new-stakeholder-cv :<! :1
-- :doc Insert new Stakeholder cv
insert into stakeholder_cv (cv)
values(:cv) returning id;

-- :name add-stakeholder-geo :? :*
-- :doc add stakeholder geo
insert into stakeholder_geo_coverage(stakeholder, country_group, country)
values :t*:geo RETURNING *;

-- :name get-admins :?
-- :doc Get information of all the admins
select id, first_name, last_name, email from stakeholder
 where role = 'ADMIN'
   and review_status = 'APPROVED';

-- :name get-suggested-stakeholders :?
-- :doc Get distinct stakeholders based on matching seeking and offerings.
WITH suggested_stakeholders AS (
    SELECT
	DISTINCT s.*
    FROM
	stakeholder s
	JOIN stakeholder_tag st ON s.id = st.stakeholder
	JOIN tag t ON st.tag = t.id
    WHERE
	t.id IN (:v*:seeking-ids-for-offerings)
	AND s.id != :stakeholder-id
	AND st.tag_relation_category = 'offering'
    UNION
    SELECT
	DISTINCT s.*
    FROM
	stakeholder s
	JOIN stakeholder_tag st ON s.id = st.stakeholder
	JOIN tag t ON st.tag = t.id
    WHERE
	t.id IN (:v*:offering-ids-for-seekings)
	AND s.id != :stakeholder-id
	AND st.tag_relation_category = 'seeking')
SELECT *
FROM
    suggested_stakeholders
WHERE review_status = 'APPROVED'
LIMIT :limit
OFFSET :offset;

-- :name get-recent-active-stakeholders :? :*
-- :doc Get stakeholders based on the most recent activites
SELECT
    DISTINCT ON (s.id)
    s.*
FROM
    stakeholder s
    JOIN activity a ON s.id = a.owner_id
    WHERE s.id NOT IN (:v*:stakeholder-ids)
    AND s.review_status = 'APPROVED'
ORDER BY
    s.id,
    a.created_at DESC
LIMIT :limit;

-- :name get-experts :? :*
-- :doc Get stakeholders based on the passed filters.
WITH experts AS (
  SELECT DISTINCT ON (s.id) s.*
  FROM stakeholder s
  JOIN stakeholder_tag st ON s.id = st.stakeholder AND st.tag_relation_category = 'expertise'
),
filtered_experts AS (
  SELECT s.*, row_to_json(o.*) AS affiliation, json_agg(json_build_object('id', t.id, 'tag', t.tag, 'tag_relation_category', st.tag_relation_category, 'tag_category', tg.category)) FILTER (WHERE t.id IS NOT NULL) AS tags
  FROM stakeholder s
  JOIN experts e ON e.id = s.id
  JOIN stakeholder_tag st ON s.id = st.stakeholder
  JOIN tag t ON st.tag = t.id
  JOIN tag_category tg ON t.tag_category = tg.id
  LEFT JOIN organisation o ON o.id = s.affiliation
  WHERE 1=1
  --~(when (seq (get-in params [:filters :tags])) " AND LOWER(t.tag) IN (:v*:filters.tags)")
  --~(when (seq (get-in params [:filters :ids])) " AND s.id IN (:v*:filters.ids)")
  --~(when (seq (get-in params [:filters :countries])) " AND s.country IN (:v*:filters.countries)")
  GROUP BY s.id, o.id
),
experts_by_country AS (
  SELECT country AS country_id, count(*) AS counts
  FROM filtered_experts
  WHERE country IS NOT NULL
  GROUP BY country
),
experts_by_country_aggregate AS (
  SELECT 'countries' AS count_of, COALESCE(json_agg(json_build_object('country_id', country_id, 'counts', counts)), '[]'::json) AS counts
  FROM experts_by_country
)
,
experts_count AS (
  SELECT 'experts' AS count_of, count(*) AS counts
  FROM filtered_experts
)
/*~ (if (:count-only? params) */
SELECT row_to_json(ec.*) AS count_results
FROM experts_count ec
UNION ALL
SELECT row_to_json(eca.*) AS count_results
FROM experts_by_country_aggregate eca
/*~*/
SELECT * FROM filtered_experts
LIMIT :page-size
OFFSET :offset
/*~ ) ~*/

-- :name create-stakeholders :<! :*
-- :doc Creates N stakeholders. Type conversions needs to be handled before calling this funtions.
INSERT INTO stakeholder(:i*:cols)
VALUES :t*:values RETURNING id, email;

-- :name get-stakeholders :query :many
-- :doc Get stakeholders with filters
SELECT s.*, json_agg(json_build_object('id', t.id, 'tag', t.tag, 'tag_relation_category', st.tag_relation_category, 'tag_category', tg.category)) FILTER (WHERE t.id IS NOT NULL) AS tags
FROM stakeholder s
LEFT JOIN stakeholder_tag st ON st.stakeholder = s.id
LEFT JOIN tag t ON st.tag = t.id
LEFT JOIN tag_category tg ON t.tag_category = tg.id
WHERE 1=1
--~(when (seq (get-in params [:filters :review-statuses])) " AND s.review_status = ANY(ARRAY[:v*:filters.review-statuses]::review_status[])")
--~(when (seq (get-in params [:filters :ids])) " AND s.id IN (:v*:filters.ids)")
--~(when (seq (get-in params [:filters :roles])) " AND s.role = ANY(ARRAY[:v*:filters.roles]::stakeholder_role[])")
--~(when (seq (get-in params [:filters :search-text])) " AND (LOWER(s.first_name) ILIKE '%' || :filters.search-text || '%' OR LOWER(s.last_name) ILIKE '%' || :filters.search-text || '%' OR LOWER(s.email) ILIKE '%' || :filters.search-text || '%')")
GROUP BY s.id

-- :name delete-stakeholder* :execute :affected
DELETE FROM stakeholder
WHERE id = :id;

-- :name get-stakeholders-files-to-migrate
-- :doc this query is for file migration purposes and will be removed.
WITH stakeholder_files_refs AS (
	SELECT id, 'picture' AS file_type, picture AS reference FROM stakeholder
	WHERE picture ILIKE '/image/profile/%'
	AND picture_id IS NULL
	UNION
	SELECT id, 'cv' AS file_type, cv AS reference FROM stakeholder
	WHERE cv ILIKE '/cv/profile/%' AND cv_id IS NULL
),
stakeholder_db_files AS (
	SELECT sfr.id, 'picture' AS file_type, 'images' AS file_key, sp.picture AS content
	FROM stakeholder_files_refs sfr
	LEFT JOIN stakeholder_picture sp ON substring(sfr.reference FROM '^\/image\/profile\/([0-9]+)$')::INTEGER = sp.id
	WHERE sp.picture IS NOT NULL AND sfr.file_type = 'picture'
	UNION
	SELECT sfr.id, 'cv' AS file_type, 'cvs' AS file_key, scv.cv AS content
	FROM stakeholder_files_refs sfr
	LEFT JOIN stakeholder_cv scv ON substring(sfr.reference FROM '^\/cv\/profile\/([0-9]+)$')::INTEGER = scv.id
	WHERE scv.cv IS NOT NULL AND sfr.file_type = 'cv'
),
stakeholder_files_to_migrate AS (
	SELECT id, file_type, file_key, content
	FROM stakeholder_db_files
	UNION
	SELECT id, 'picture' AS file_type, 'images' AS file_key, picture AS content
	FROM stakeholder
	WHERE picture IS NOT NULL
	AND (picture NOT ILIKE 'https://storage.googleapis.com/%' AND picture NOT ILIKE '/image/profile/%')
	AND picture_id IS NULL
	UNION
	SELECT id, 'cv' AS file_type, 'cvs' AS file_key, cv AS content
	FROM stakeholder
	WHERE cv IS NOT NULL
	AND (cv NOT ILIKE 'https://storage.googleapis.com/%' AND cv NOT ILIKE '/cv/profile/%')
	AND cv_id IS NULL
)
SELECT * FROM stakeholder_files_to_migrate
ORDER BY id
--~ (when (:limit params) " LIMIT :limit")
;
