-- :name all-countries :? :*
-- :doc Get all countries
select * from country order by id


-- :name country-by-id :? :1
-- :doc Get country by id
select * from country where id = :id
