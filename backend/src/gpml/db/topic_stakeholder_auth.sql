-- :name get-auth-by-topic :? :*
-- :doc Get details about a particular topic
select * from topic_stakeholder_auth where topic_id=:topic-id and topic_type=:topic-type::topic_type;

-- :name get-auth-by-topic-and-stakeholder :? :1
-- :doc Get details about a particular topic
select * from topic_stakeholder_auth where topic_id=:topic-id and topic_type=:topic-type::topic_type and stakeholder=:stakeholder;

-- :name get-auth-by-stakeholder :? :*
-- :doc Get details about a particular topic
select * from topic_stakeholder_auth where stakeholder=:stakeholder;


-- :name new-auth :! :1
INSERT INTO topic_stakeholder_auth(stakeholder, topic_id, topic_type, roles)
values (:stakeholder, :topic-id, :topic-type::topic_type, :roles)

-- :name delete-auth :! :n
delete from topic_stakeholder_auth
where stakeholder=:stakeholder and
topic_id=:topic-id and
topic_type=:topic-type::topic_type


-- :name update-auth :! :n
update topic_stakeholder_auth set roles = :roles
where stakeholder=:stakeholder and
topic_id=:topic-id and
topic_type=:topic-type::topic_type
