-- Generic HugSQL statements for the relation resource and tags. Bear
-- in mind that the term 'resource' means all resources of the
-- platform which includes: Policy, Technology, Event, Financing,
-- Technical, Action Plan, Organization and Stakeholder. That is, it
-- is not about 'resource' table solely.

-- :name create-resource-tags :insert-returning :many
-- :doc Creates a relation for <resource>_tag.
INSERT INTO :i:table (:i:resource-col, tag
--~(when (= (:table params) "stakeholder_tag") ", tag_relation_category")
)
VALUES :t*:tags RETURNING *;

-- :name create-resource-tags-v2 :insert-returning :many
-- :doc Same as create-resource-tags but columns are defined programatically.
INSERT INTO :i:table(:i*:insert-cols)
VALUES :t*:insert-values RETURNING *;

-- :name delete-resource-tags :execute :affected
-- :doc Delete relation for <resource>_tag.
DELETE FROM :i:table WHERE :i:resource-col = :resource-id;

-- :name get-resource-tags :query :many
-- :doc Get resource tags
SELECT rt.:i:resource-col, t.id, t.tag, tg.category AS tag_category
--~(when (= (:table params) "stakeholder_tag") ", rt.tag_relation_category")
FROM :i:table rt
JOIN tag t ON rt.tag = t.id
JOIN tag_category tg ON t.tag_category = tg.id
WHERE rt.:i:resource-col = :resource-id
AND t.review_status = 'APPROVED';

-- :name get-tags-from-resources :query :many
-- :doc Get all the tags for all the resources
SELECT rt.:i:resource-col, rt.tag
FROM :i:table rt
WHERE rt.:i:resource-col in (:v*:resource-ids);
