-- :name all-countries :? :*
-- :doc Get all tags
select * from tag order by id

-- :name tag-by-id :? :1
-- :doc Get tag by id
select * from tag where id = :id

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

-- :name new-tags :? :*
-- :doc Insert new tag
insert into tag (tag, tag_category)
values :t*:tags RETURNING *;

-- :name tag-by-category :? :* :1
-- :doc Get tag by category
select * from tag WHERE tag_category in
(select id from tag_category WHERE category LIKE :category);

-- :name all-tags :? :*
-- :doc Get all tags
select tg.category, t.id, t.tag
 from tag_category tg, tag t
where tg.id = t.tag_category
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
