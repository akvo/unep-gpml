-- :name all-stakeholder :? :*
-- :doc Get all stakeholder
select * from stakeholder order by id;

-- :name stakeholder-by-id :? :1
-- :doc Get stakeholder by id
select
    s.id,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.picture as photo,
    s.linked_in,
    s.twitter,
    s.representation,
    s.about,
    s.role,
    s.geo_coverage_type,
    s.cv,
    c.iso_code as country,
    s.affiliation,
    s.organisation_role,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status from stakeholder s
left join country c on (s.country = c.id)
where s.id = :id;

-- :name stakeholder-by-email :? :1
-- :doc Get stakeholder by email
select
    s.id,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.picture as photo,
    s.linked_in,
    s.twitter,
    s.representation,
    s.about,
    s.role,
    s.geo_coverage_type,
    s.cv,
    c.iso_code as country,
    s.affiliation,
    s.organisation_role,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status from stakeholder s
left join country c on (s.country = c.id)
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
    s.picture as photo,
    s.linked_in,
    s.twitter,
    s.representation,
    s.about,
    s.role,
    s.geo_coverage_type,
    c.iso_code as country,
    s.affiliation,
    s.organisation_role,
    s.reviewed_at,
    s.reviewed_by,
    s.review_status from stakeholder s
left join country c on (s.country = c.id)
where s.review_status <> 'APPROVED' order by s.created desc;

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
    picture,
    title,
    first_name,
    last_name,
    affiliation,
    email,
    country,
    representation,
    geo_coverage_type
--~ (when (contains? params :linked_in) ",linked_in")
--~ (when (contains? params :twitter) ",twitter")
--~ (when (contains? params :cv) ",cv")
--~ (when (contains? params :about) ",about")
--~ (when (contains? params :organisation_role) ",organisation_role")
) values(
    :picture,
    :title,
    :first_name,
    :last_name,
    :affiliation,
    :email,
    :country::integer,
    :representation,
    :v:geo_coverage_type::geo_coverage_type
--~ (when (contains? params :linked_in) ",:linked_in")
--~ (when (contains? params :twitter) ",:twitter")
--~ (when (contains? params :cv) ",:cv")
--~ (when (contains? params :about) ",:about")
--~ (when (contains? params :organisation_role) ",:organisation_role")
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
--~ (when (contains? params :title) "title = :title")
--~ (when (contains? params :first_name) ",first_name= :first_name")
--~ (when (contains? params :last_name) ",last_name= :last_name")
--~ (when (contains? params :affiliation) ",affiliation= :v:affiliation::integer")
--~ (when (contains? params :linked_in) ",linked_in= :linked_in")
--~ (when (contains? params :twitter) ",twitter= :twitter")
--~ (when (contains? params :picture) ",picture= :picture")
--~ (when (contains? params :cv) ",cv= :cv")
--~ (when (contains? params :country) ",country= :v:country::integer")
--~ (when (contains? params :representation) ",representation= :representation")
--~ (when (contains? params :organisation_role) ",organisation_role= :organisation_role")
--~ (when (contains? params :geo_coverage_type) ",geo_coverage_type= :v:geo_coverage_type::geo_coverage_type")
--~ (when (contains? params :about) ",about= :about")
    , modified = now()
where id = :id;

-- :name stakeholder-picture-by-id :? :1
-- :doc Get Stakeholder picture by id
select * from stakeholder_picture where id = :id

-- :name new-stakeholder-picture :<! :1
-- :doc Insert new Stakeholder picture
insert into stakeholder_picture (picture)
values(:picture) returning id;

-- :name delete-stakeholder-picture-by-id :! :n
-- :doc remove stakeholder picture
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

-- :name stakeholder-geo-country :? :*
-- :doc get stakeholder geocoverage country
select c.iso_code from stakeholder_geo_coverage s
left join country c on c.id = s.country
where s.stakeholder = :id

-- :name stakeholder-geo-country-group :? :*
-- :doc get stakeholder geocoverage country group
select c.name from stakeholder_geo_coverage s
left join country_group c on c.id = s.country_group
where s.stakeholder = :id

-- :name add-stakeholder-geo :<! :1
-- :doc add stakeholder geo
insert into stakeholder_geo_coverage(stakeholder, country_group, country)
values :t*:geo RETURNING id;

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
