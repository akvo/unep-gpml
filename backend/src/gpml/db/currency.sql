-- :name new-currency :!
insert into currency (name, iso_code)
values (:name, :iso_code)
