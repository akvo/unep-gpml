-- :name new-currency :!
insert into currency (name, iso_code)
values (:name, :iso_code)

-- :name all-currencies :? :*
-- :doc Get all currency
select iso_code as value, iso_code || ' '|| name as label from currency;
