-- :name create-invitations* :returning-execute :many
INSERT INTO invitation(:i*:cols)
VALUES :t*:values RETURNING *;

-- :name get-invitations* :query :many
SELECT * FROM invitation
WHERE 1=1
--~ (when (seq (get-in params [:filters :emails])) " AND email IN (:v*:filters.emails)")
--~ (when (seq (get-in params [:filters :stakeholders-ids])) " AND stakeholder_id IN (:v*:filters.stakeholders-ids)")
--~ (when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")
--~ (when (true? (get-in params [:filters :pending?])) " AND accepted_at IS NULL")
--~ (when (false? (get-in params [:filters :pending?])) " AND accepted_at IS NOT NULL")

-- :name accept-invitation* :execute :affected
UPDATE invitation
SET accepted_at = now()
WHERE id = :id

-- :name delete-invitation* :execute :affected
DELETE FROM invitation
WHERE id = :id;
