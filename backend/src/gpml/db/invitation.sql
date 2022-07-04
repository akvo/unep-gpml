-- :name create-invitations :<! :*
INSERT INTO invitation(id, stakeholder_id, email)
VALUES :t*:values RETURNING *;

-- :name get-invitations
SELECT * FROM invitation
WHERE 1=1
--~ (when (seq (get-in params [:filters :emails])) " AND email IN (:v*:filters.emails)")
--~ (when (seq (get-in params [:filters :stakeholders-ids])) " AND stakeholder_id IN (:v*:filters.stakeholders-ids)")
--~ (when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")
--~ (when (true? (get-in params [:filters :pending?])) " AND accepted_at IS NULL")
--~ (when (false? (get-in params [:filters :pending?])) " AND accepted_at IS NOT NULL")

-- :name accept-invitation :! :n
UPDATE invitation
SET accepted_at = :accepted-at
WHERE id = :id
