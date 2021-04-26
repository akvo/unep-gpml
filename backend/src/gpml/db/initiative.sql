-- :name new-initiative :<! :1
-- :doc Insert a new initiative
-- :require [gpml.sql-util :as sqlutil]
insert into initiative(
--~ (sqlutil/generate-insert params)
) values (
--~ (sqlutil/generate-jsonb params)
) returning id;

-- :name initiative-by-id :? :1
select * from initiative where id = :id;
