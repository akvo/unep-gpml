-- :name all-countries :? :*
-- :doc Get all tags
select * from tag order by id

-- :name tag-by-id :? :1
-- :doc Get tag by id
select * from tag where id = :id

-- :name tag-by-tags :? :*
-- :doc Get tag by tags
select * from tag where tag in (:v*:tags)
