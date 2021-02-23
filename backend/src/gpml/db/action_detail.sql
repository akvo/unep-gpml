-- :name all-action_details :? :*
-- :doc Get all action_details
select * from action_detail order by id

-- :name action-detail-by-code :? :1
-- :doc Get action_detail by code
select * from action_detail where code = :code

-- :name action-detail-by-action-id :? :1
-- :doc Get action_detail by code
select * from action_detail where action = :id

-- :name action-detail-by-parent :? :*
-- :doc Get action_detail by code
select * from action_detail where parent = :code

-- :name action-detail-by-codes :? :*
-- :doc Get action_detail by codes
select * from action_detail where code in (:v*:codes)
