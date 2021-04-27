-- :name new-initiative :<! :1
-- :doc Insert a new initiative
-- :require [gpml.sql-util]
insert into initiative(
--~ (#'gpml.sql-util/generate-insert params)
) values (
--~ (#'gpml.sql-util/generate-jsonb params)
) returning id;

-- :name initiative-by-id :? :1
select * from initiative where id = :id;
