-- :name all-actions :? :*
-- :doc Get all actions
select * from action order by id

-- :name action-by-code :? :1
-- :doc Get action by code
select * from action where code = :code

-- :name action-by-codes :? :*
-- :doc Get action by codes
select * from action where code in (:v*:codes)

-- :name action-by-parent :? :*
-- :doc Get action by parent
select * from action where parent = :code
