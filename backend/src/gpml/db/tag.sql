-- :name get-flat-tags :? :*
-- :doc Get all tags
SELECT * FROM tag
--~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
ORDER BY id;

-- :name tag-by-tags :? :*
-- :doc Get tag by tags
select * from tag where tag in (:v*:tags)

-- :name new-tag-category :<! :1
-- :doc Insert new tag category
insert into tag_category(category)
values (:category) returning id

-- :name tag-category-by-category-name :<! :1
-- :doc Get id of tag category given a category name
select id from tag_category where category = :category

-- :name new-tag :<! :1
-- :doc Insert new tag
insert into tag (tag, tag_category)
values (:tag, :tag_category) returning id

-- :name new-tags :query :many
-- :doc Insert new tag
insert into tag (:i*:insert-cols)
values :t*:tags ON CONFLICT (LOWER(tag)) DO UPDATE SET tag = tag.tag RETURNING *;

-- :name tag-by-category :? :* :1
-- :doc Get tag by category
select * from tag WHERE tag_category in
(select id from tag_category WHERE category LIKE :category);

-- :name all-tags :? :*
-- :doc Get all tags
select tg.category, t.id, t.tag
 from tag_category tg, tag t
where tg.id = t.tag_category
and t.review_status = 'APPROVED'
order by tg.category, t.tag

-- :name get-popular-topics-tags :? :*
-- :doc Get popular topics tags and their count based on the number of times they are used.
-- :require [gpml.db.tag]
--~(#'gpml.db.tag/generate-popular-topics-tags-count-cte {} {})
,
popular_topics_tags_filtered AS (
SELECT *
FROM popular_topics_tags_count
WHERE 1=1
--~(when (seq (get-in params [:filters :tags])) " AND tag IN (:v*:filters.tags)")
)
SELECT
    tag,
    CAST(SUM(count) AS integer) AS count
FROM
    popular_topics_tags_filtered
GROUP BY
    tag
ORDER BY
    count DESC
--~(if (:limit params) "LIMIT :limit;" ";")

-- :name get-popular-topics-tags-subset :? :*
-- :doc Get popular topics tags and their count based on the number of times they are used within a selected popular tag subset.
-- :require [gpml.db.tag]
--~(#'gpml.db.tag/generate-popular-topics-tags-subset-cte {} {})
SELECT *
FROM popular_topics_tags_subset_cte
WHERE tag IN (:v*:filters.tags);

-- :name get-more-popular-topics-tags :? :*
-- :doc Get popular topics tags and their count based on the number of times they are used.
-- :require [gpml.db.tag]
--~(#'gpml.db.tag/generate-more-popular-topics-tags-count-cte (dissoc params :limit :offset) (keys (dissoc params :limit :offset)))
SELECT
    tag,
    CAST(SUM(count) AS integer) AS count
FROM
    popular_topics_tags_count
GROUP BY
    tag
ORDER BY
    count DESC
--~(if (:limit params) "LIMIT :limit;" ";")

-- :name get-tag-categories :query :many
-- :doc Get tag categories. Optionally applying passed filters
SELECT
    *
FROM
    tag_category
--~(when (seq (:filters params)) "WHERE 1=1")
--~(when (get-in params [:filters :id]) " AND id = :filters.id")
--~(when (seq (get-in params [:filters :categories])) " AND category IN (:v*:filters.categories)")
;

-- :name update-tag :! :n
-- :doc Updates a tag.
/* :require [clojure.string :as str]
            [hugsql.parameters :refer [identifier-param-quote]] */
UPDATE tag
SET
/*~
(str/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :updates." (name field))))
~*/
WHERE id = :id;

-- :name create-tags :insert-returning :many
-- :doc Create tags. If they already exists do nothing.
INSERT INTO tag(:i*:insert-cols)
VALUES :t*:insert-values
ON CONFLICT (LOWER(tag)) DO NOTHING RETURNING *;

-- :name get-tags :query :many
-- :doc Get tags. Applying optional filters if provided.
SELECT t.id,
       t.tag,
       t.tag_category AS tag_category_id,
       t.review_status,
       t.review_status,
       t.reviewed_by,
       t.reviewed_at,
       t.definition,
       t.ontology_ref_link,
       tg.category AS tag_category
FROM tag t
JOIN tag_category tg ON t.tag_category = tg.id
WHERE 1=1
--~(when (seq (get-in params [:filters :tags])) " AND (LOWER(t.tag)) IN (:v*:filters.tags)")
--~(when (seq (get-in params [:filters :ids])) " AND t.id IN (:v*:filters.ids)")
--~(when (seq (get-in params [:filters :tag_categories])) " AND tg.category IN (:v*:filters.tag_categories")
--~(when (seq (get-in params [:filters :tag_categories_ids])) " AND t.tag_category IN (:v*:filters.tag_categories_ids")
--~(when (seq (get-in params [:filters :review_statuses])) " AND t.review_status = ANY(:filters.review_statuses")
--~(when (seq (get-in params [:filters :reviewed_by])) " AND t.review_status IN (:v*:filters.reviewed_by")
;
