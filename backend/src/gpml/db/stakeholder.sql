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
    c.iso_code as country,
    o.name as org_name,
    s.approved_at from stakeholder s
left join country c on (s.country = c.id)
left join organisation o on (s.affiliation = o.id)
where s.email = :email;

-- :name approved-stakeholder-by-email :? :1
-- :doc Get an stakeholder by email filtering by approved
select * from stakeholder where email = :email and approved_at is not null;

-- :name pending-approval :? :*
-- :doc Get unapproved of stakeholder profile
select * from stakeholder where approved_at is null order by created desc;

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
update stakeholder
    set title = :title,
        first_name = :first_name,
        last_name = :last_name,
        affiliation = :affiliation,
        email = :email,
        linked_in = :linked_in,
        twitter = :twitter,
        url = :url,
        country = :country::integer,
        representation = :representation,
        about = :about,
        geo_coverage_type = :v:geo_coverage_type::geo_coverage_type,
        role = :v:role::stakeholder_role
where id = :id;
