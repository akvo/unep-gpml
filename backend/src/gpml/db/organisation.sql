-- :name all-organisation :? :*
-- :doc Get all organisations
select id, name from organisation order by id

-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select * from organisation where id = :id

-- :name organisation-by-name :? :1
-- :doc Get organisation by name
select id from organisation where lower(name) = lower(:name)

-- :name organisation-by-names :? :*
-- :doc Get organisation by names
select * from organisation where name in (:v*:names)


-- :name new-organisation :<! :1
insert into organisation (name)
values (:name) returning id;
