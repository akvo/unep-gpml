-- :name all-countries :? :*
-- :doc Get all countries
select * from country order by id

-- :name country-by-id :? :1
-- :doc Get country by id
select * from country where id = :id

-- :name country-by-names :? :*
-- :doc Get country by names
select * from country where name in (:v*:names)
