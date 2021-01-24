-- :name all-countries :? :*
-- :doc Get all tags
select * from tag order by id

-- :name tag-by-id :? :1
-- :doc Get tag by id
select * from tag where id = :id

-- :name tag-by-tags :? :*
-- :doc Get tag by tags
select * from tag where tag in (:v*:tags)

-- :name new-tag-category :<!
-- :doc Insert new tag category
insert into tag_category(category)
values (:category) returning id

-- :name new-tag :<!
-- :doc Insert new tag
insert into tag (tag, tag_category)
values (:tag, :tag_category) returning id

-- :name tag-by-category :? :*
-- :doc Get tag by category
select * from tag WHERE tag_category in
(select id from tag_category WHERE category LIKE :category);
