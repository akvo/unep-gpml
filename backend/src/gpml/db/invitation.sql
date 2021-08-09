-- :name all-invitations :? :*
-- :doc Get all invitations
select * from invitation order by id

-- :name invitation-by-id :? :1
-- :doc Get invitation by id
select * from invitation where id = :id;

-- :name invitation-by-email :? :1
-- :doc Get invitation by email
select * from invitation where lower(email) = lower(:email)

-- :name invitation-by-entity :? :*
-- :doc Get invitation by organisation-id
select * from invitation where entity = :organisation-id

-- :name new-invitation :<! :1
INSERT INTO invitation (stakeholder, organisation, email, accepted)
VALUES (:stakeholder-id, :organisation-id, :email, :accepted) returning id;

-- :name accept-invitation :! :n
-- :doc accept invitation
update invitation set accepted = :accepted where email = :email
