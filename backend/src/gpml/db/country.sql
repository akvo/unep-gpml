-- :name all-countries :? :*
-- :doc Get all countries
select * from country where iso_code is not null order by id

-- :name country-by-id :? :1
-- :doc Get country by id
select * from country where id = :id

-- :name country-by-ids :? :*
-- :doc Get country by ids
select * from country where id in (:v*:ids)

-- :name country-by-names :? :*
-- :doc Get country by names
select * from country where name in (:v*:names)

-- :name country-by-name :? :1
-- :doc Get country by name
select id from country where name = :name

-- :name country-by-code :? :1
-- :doc Get country by iso_code
select id from country where iso_code = :name

-- :name country-by-codes :? :*
-- :doc Get country by iso_codes
select id from country where iso_code in (:v*:codes)

-- :name new-country :<!
-- :doc Insert new country
insert into country (name, iso_code)
values(:name, :iso_code) returning id
