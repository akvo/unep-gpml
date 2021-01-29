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
    s.url as org_url,
    s.representation,
    s.about,
    s.role,
    s.geo_coverage_type,
    c.iso_code as country,
    o.name as org_name,
    s.approved_at from stakeholder s
left join country c on (s.country = c.id)
left join organisation o on (s.affiliation = o.id)
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
    s.url as org_url,
    s.representation,
    s.about,
    s.role,
    s.geo_coverage_type,
    c.iso_code as country,
    o.name as org_name,
    s.approved_at from stakeholder s
left join country c on (s.country = c.id)
left join organisation o on (s.affiliation = o.id)
where s.email = :email;

-- :name admin-by-email :? :1
-- :doc Get an admin id by email
select id from stakeholder
 where email = :email
   and approved_at is not null
   and role = 'ADMIN';

-- :name approved-stakeholder-by-email :? :1
-- :doc Get an stakeholder by email filtering by approved
select * from stakeholder where email = :email and approved_at is not null;

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
    s.url as org_url,
    s.representation,
    s.about,
    s.role,
    s.geo_coverage_type,
    c.iso_code as country,
    o.name as org_name,
    s.approved_at from stakeholder s
left join country c on (s.country = c.id)
left join organisation o on (s.affiliation = o.id)
where s.approved_at is null order by s.created desc;

-- :name approve-stakeholder :! :n
-- :doc Approve stakeholder
update stakeholder set approved_at = now() where id = :id;

-- :name new-stakeholder :<!
-- :doc Insert a new stakeholder
insert into stakeholder(picture, title, first_name, last_name, affiliation, email, linked_in, twitter, url, country, representation, about, geo_coverage_type)
values(:picture, :title, :first_name, :last_name, :affiliation, :email, :linked_in, :twitter, :url, :country::integer, :representation, :about, :v:geo_coverage_type::geo_coverage_type) RETURNING id;

-- :name update-stakeholder-role :! :n
-- :doc Update stakeholder role
update stakeholder
    set role = :v:role::stakeholder_role,
        modified = now()
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
--~ (when (contains? params :url) ",url= :url")
--~ (when (contains? params :picture) ",picture= :picture")
--~ (when (contains? params :country) ",country= :v:country::integer")
--~ (when (contains? params :representation) ",representation= :representation")
--~ (when (contains? params :geo_coverage_type) ",geo_coverage_type= :v:geo_coverage_type::geo_coverage_type")
--~ (when (contains? params :about) ",about= :about, modified = now()")
where id = :id;


-- :name stakeholder-picture-by-id :? :1
-- :doc Get Stakeholder picture by id
select * from stakeholder_picture where id = :id

-- :name new-stakeholder-picture :<! :1
-- :doc Insert new Stakeholder picture
insert into stakeholder_picture (picture)
values(:picture) returning id;

-- :name stakeholder-geocoverage :

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

-- :name add-stakeholder-geo :<!
-- :doc add stakeholder geo
insert into stakeholder_geo_coverage(stakeholder, country_group, country)
values :t*:geo RETURNING id;

-- :name delete-stakehodler-geo :! :n
-- :doc remove stakeholder geo
delete from stakeholder_geo_coverage where stakeholder = :id

-- :name stakeholder-tags :? :*
-- :doc get stakeholder tags
select * from stakeholder_tag where stakeholder = :id

-- :name add-stakeholder-tags :<!
-- :doc add stakeholder tags
insert into stakeholder_tag(stakeholder, tag)
values :t*:tags RETURNING id;

-- :name delete-stakehodler-tags :! :n
-- :doc remove stakeholder-tags
delete from stakeholder_tag where stakeholder = :id
