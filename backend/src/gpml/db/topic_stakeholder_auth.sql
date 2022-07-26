-- :name get-topic-stakeholder-auths :query :many
-- :doc Generic get topic stakeholder auths supporting filters.
SELECT *
FROM topic_stakeholder_auth
WHERE 1=1
--~(when (seq (get-in params [:filters :topics-ids])) " AND topic_id IN (:v*:filters.topics-ids)")
--~(when (seq (get-in params [:filters :topic-types])) " AND topic_type = ANY(CAST(ARRAY[:v*:filters.topic-types] AS topic_type[]))")
--~(when (seq (get-in params [:filters :stakeholders-ids])) " AND stakeholder IN (:v*:filters.stakeholders-ids)")
--~(when (seq (get-in params [:filters :roles])) " AND roles ??| CAST(ARRAY[:v*:filters.roles] AS text[])")

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

-- :name delete-auth-by-topic :! :n
delete from topic_stakeholder_auth
where topic_id=:topic-id and
topic_type=:topic-type::topic_type


-- :name update-auth :! :n
update topic_stakeholder_auth set roles = :roles
where stakeholder=:stakeholder and
topic_id=:topic-id and
topic_type=:topic-type::topic_type
