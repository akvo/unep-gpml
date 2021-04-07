-- :name new-currency :!
insert into currency (name, iso_code)
values (:name, :iso_code)

-- :name all-currencies :? :1
-- :doc Get all tags
select array_agg(iso_code) from currency limit 1;
