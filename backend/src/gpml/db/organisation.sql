-- :name all-countries :? :*
-- :doc Get all organisations
select * from organisation order by id

-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select * from organisation where id = :id

-- :name organisation-by-names :? :*
-- :doc Get organisation by names
select * from organisation where name in (:v*:names)
