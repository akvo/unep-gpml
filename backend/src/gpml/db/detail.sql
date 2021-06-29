-- :name get-detail :? :1
-- :doc Get details about a particular topic
SELECT json
  FROM v_topic
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id

-- :name get-stakeholder-tags :? :1
-- :doc Get Stakehodler tags
SELECT json_object_agg(category,tag) AS data FROM (
    SELECT string_agg(t.tag,', ') AS tag, tc.category FROM stakeholder_tag st
    LEFT JOIN tag t ON st.tag = t.id
    LEFT JOIN tag_category tc ON t.tag_category = tc.id
WHERE st.stakeholder = :id
GROUP BY tc.category) AS data;

-- :name update-resource :! :n
-- :doc Update the resource specified by table and id
-- Code from the HugSql example for generic update (https://www.hugsql.org/)
/* :require [clojure.string :as string]
            [hugsql.parameters :refer [identifier-param-quote]] */
update :i:table set
/*~
(string/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :v:updates." (name field))))
~*/
where id = :id
