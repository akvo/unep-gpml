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
select * from stakeholder
--~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
order by id;

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
    s.picture as photo,
    s.linked_in,
    s.twitter,
    s.about,
    s.role,
    s.job_title,
    s.cv,
    s.country,
    s.affiliation,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status from stakeholder s
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
    s.picture as photo,
    s.linked_in,
    s.twitter,
    s.about,
    s.role,
    s.job_title,
    s.cv,
    s.country,
    s.affiliation,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status from stakeholder s
where s.email = :email;

-- :name admin-by-email :? :1
-- :doc Get an admin id by email
select id from stakeholder
 where email = :email
   and review_status = 'APPROVED'
   and role = 'ADMIN';

-- :name approved-stakeholder-by-email :? :1
-- :doc Get an stakeholder by email filtering by approved
select * from stakeholder where email = :email and review_status = 'APPROVED';

-- :name pending-approval :? :*
-- :doc Get unapproved of stakeholder profile
select
    s.id,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.idp_usernames,
    s.picture as photo,
    s.linked_in,
    s.twitter,
    to_json(o.*) AS org,
    s.organisation_role,
    s.about,
    s.role,
    s.job_title,
    s.geo_coverage_type,
    geo.geo_coverage_values,
    c.name as country,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status,
    tag.tags
FROM (((stakeholder s
        LEFT JOIN (
            SELECT st.stakeholder,
            json_agg(t.*) AS tags
            FROM (stakeholder_tag st JOIN (
                    SELECT tg.id, tg.tag, tc.category
                    FROM tag tg
                    LEFT JOIN tag_category tc ON tg.tag_category = tc.id) t ON ((st.tag = t.id)))
            GROUP BY st.stakeholder) tag ON ((s.id = tag.stakeholder)))
            LEFT JOIN (
                SELECT sg.stakeholder, json_agg(COALESCE(c_1.iso_code, (cg.name)::bpchar))
                AS geo_coverage_values
                FROM ((stakeholder_geo_coverage sg
                    LEFT JOIN country c_1 ON ((sg.country = c_1.id)))
                    LEFT JOIN country_group cg ON ((sg.country_group = cg.id)))
                GROUP BY sg.stakeholder) geo ON ((s.id = geo.stakeholder))
            LEFT JOIN country c ON ((s.country = c.id)))
    LEFT JOIN organisation o ON ((s.affiliation = o.id)))
where s.review_status = 'SUBMITTED' order by s.created desc;

-- :name update-stakeholder-status :! :n
-- :doc Approve stakeholder
update stakeholder
set reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
where id = :id;

-- :name new-stakeholder :<! :1
-- :doc Insert a new stakeholder
insert into stakeholder(
    first_name,
    last_name,
    email
--~ (when (contains? params :title) ", title")
--~ (when (contains? params :picture) ", picture")
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :idp_usernames) ", idp_usernames")
--~ (when (contains? params :affiliation) ",affiliation")
--~ (when (contains? params :linked_in) ",linked_in")
--~ (when (contains? params :twitter) ",twitter")
--~ (when (contains? params :cv) ",cv")
--~ (when (contains? params :about) ",about")
--~ (when (contains? params :organisation_role) ",organisation_role")
--~ (when (contains? params :public_email) ",public_email")
--~ (when (contains? params :public_database) ",public_database")
--~ (when (contains? params :job_title) ",job_title")
--~ (when (contains? params :id) ",id")
) values(
    :first_name,
    :last_name,
    :email
--~ (when (contains? params :title) ", :title")
--~ (when (contains? params :picture) ", :picture")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :idp_usernames) ", :idp_usernames::jsonb")
--~ (when (contains? params :affiliation) ",:affiliation")
--~ (when (contains? params :linked_in) ",:linked_in")
--~ (when (contains? params :twitter) ",:twitter")
--~ (when (contains? params :cv) ",:cv")
--~ (when (contains? params :about) ",:about")
--~ (when (contains? params :organisation_role) ",:organisation_role")
--~ (when (contains? params :public_email) ",:public_email")
--~ (when (contains? params :public_database) ",:public_database")
--~ (when (contains? params :job_title) ",:job_title")
--~ (when (contains? params :id) ",:id")
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

-- :name update-stakeholder :! :n
-- :doc Update stakeholder column
update stakeholder set
--~ (when (contains? params :title) "title = :title,")
--~ (when (contains? params :first_name) "first_name= :first_name,")
--~ (when (contains? params :last_name) "last_name= :last_name,")
--~ (when (contains? params :affiliation) "affiliation= :v:affiliation::integer, ")
--~ (when (contains? params :linked_in) "linked_in= :linked_in,")
--~ (when (contains? params :twitter) "twitter= :twitter,")
--~ (when (contains? params :picture) "picture= :picture,")
--~ (when (contains? params :cv) "cv= :cv, ")
--~ (when (contains? params :country) "country= :v:country::integer,")
--~ (when (contains? params :organisation_role) "organisation_role= :organisation_role,")
--~ (when (contains? params :geo_coverage_type) "geo_coverage_type= :v:geo_coverage_type::geo_coverage_type,")
--~ (when (contains? params :about) "about= :about,")
--~ (when (contains? params :public_email) "public_email= :public_email::boolean,")
--~ (when (contains? params :public_database) "public_database= :public_database::boolean,")
--~ (when (contains? params :job_title) "job_title= :job_title,")
--~ (when (contains? params :idp_usernames) "idp_usernames= :idp_usernames::jsonb,")
    modified = now()
where id = :id;

-- :name stakeholder-image-by-id :? :1
-- :doc Get Stakeholder image by id
select * from stakeholder_picture where id = :id

-- :name new-stakeholder-image :<! :1
-- :doc Insert new Stakeholder image
insert into stakeholder_picture (picture)
values(:picture) returning id;

-- :name delete-stakeholder-image-by-id :! :n
-- :doc remove Stakeholder image
delete from stakeholder_picture where id = :id

-- :name stakeholder-cv-by-id :? :1
-- :doc Get Stakeholder cv by id
select * from stakeholder_cv where id = :id

-- :name new-stakeholder-cv :<! :1
-- :doc Insert new Stakeholder cv
insert into stakeholder_cv (cv)
values(:cv) returning id;

-- :name delete-stakeholder-cv-by-id :! :n
-- :doc remove stakeholder cv
delete from stakeholder_cv where id = :id

-- :name get-stakeholder-geo :? :*
-- :doc get stakeholder geocoverage
select * from stakeholder_geo_coverage
where stakeholder = :id;

-- :name add-stakeholder-geo :? :*
-- :doc add stakeholder geo
insert into stakeholder_geo_coverage(stakeholder, country_group, country)
values :t*:geo RETURNING *;

-- :name delete-stakeholder-geo :! :n
-- :doc remove stakeholder geo
delete from stakeholder_geo_coverage where stakeholder = :id

-- :name stakeholder-tags :? :*
-- :doc get stakeholder tags
select json_agg(st.tag) as tags, tc.category from stakeholder_tag st
left join tag t on t.id = st.tag
left join tag_category tc on t.tag_category = tc.id
where st.stakeholder = :id
group by tc.category;

-- :name add-stakeholder-tags :<! :1
-- :doc add stakeholder tags
insert into stakeholder_tag(stakeholder, tag)
values :t*:tags RETURNING id;

-- :name delete-stakeholder-tags :! :n
-- :doc remove stakeholder-tags
delete from stakeholder_tag where stakeholder = :id

-- :name get-admins :?
-- :doc Get information of all the admins
select id, first_name, last_name, email from stakeholder
 where role = 'ADMIN'
   and review_status = 'APPROVED';

-- :name get-reviewers :?
-- :doc Get information of all reviewers & admins
select id, first_name, last_name, email, role from stakeholder
 where (role = 'ADMIN' OR role = 'REVIEWER')
   and review_status = 'APPROVED';

-- :name get-suggested-stakeholders :?
-- :doc Get stakeholder based on matching seeking, offerings and location
WITH suggested_stakeholders AS (
    SELECT
        *
    FROM
        stakeholder s
        JOIN stakeholder_tag st ON s.id = st.stakeholder
        JOIN tag t ON st.tag = t.id
        JOIN tag_category tg ON t.tag_category = tg.id
    WHERE
        t.tag IN (:v*:offering-seekings)
        AND s.id != :stakeholder-id
    UNION
    SELECT
        *
    FROM
        stakeholder s
        JOIN stakeholder_tag st ON s.id = st.stakeholder
        JOIN tag t ON st.tag = t.id
        JOIN tag_category tg ON t.tag_category = tg.id
    WHERE
        t.tag IN (:v*:seeking-offerings)
        AND s.id != :stakeholder-id)
SELECT
    *
FROM
    suggested_stakeholders
LIMIT :limit
OFFSET :offset

-- :name get-recent-active-stakeholders :? :*
-- :doc Get stakeholders based on the most recent activites
SELECT
    DISTINCT ON (s.id)
    s.*
FROM
    stakeholder s
    JOIN activity a ON s.id = a.owner_id
    WHERE s.id != :stakeholder-id
ORDER BY
    s.id,
    a.created_at DESC
LIMIT :limit;

-- :name get-experts :? :*
-- :doc Get stakeholders based on the passed filters.
WITH experts AS (
  SELECT s.*
  FROM stakeholder s
  JOIN stakeholder_tag st ON s.id = st.stakeholder AND st.tag_relation_category = 'expertise'
),
filtered_experts AS (
  SELECT s.*, json_agg(json_build_object('id', t.id, 'tag', t.tag, 'tag_relation_category', st.tag_relation_category, 'tag_category', tg.category)) FILTER (WHERE t.id IS NOT NULL) AS tags
  FROM stakeholder s
  JOIN experts e ON e.id = s.id
  JOIN stakeholder_tag st ON e.id = st.stakeholder
  JOIN tag t ON st.tag = t.id
  JOIN tag_category tg ON t.tag_category = tg.id
  WHERE 1=1
  --~(when (seq (get-in params [:filters :tags])) " AND LOWER(t.tag) IN (:v*:filters.tags)")
  --~(when (seq (get-in params [:filters :ids])) " AND s.id IN (:v*:filters.ids)")
  --~(when (seq (get-in params [:filters :countries])) " AND s.country IN (:v*:filters.countries)")
  GROUP BY s.id
)
/*~ (if (:count-only? params) */
SELECT count(*) FROM filtered_experts;
/*~*/
SELECT * FROM filtered_experts
LIMIT :page-size
OFFSET :offset
/*~ ) ~*/

-- :name create-stakeholders :<! :*
-- :doc Creates N stakeholders. Type conversions needs to be handled before calling this funtions.
INSERT INTO stakeholder(:i*:cols)
VALUES :t*:values RETURNING id, email;
