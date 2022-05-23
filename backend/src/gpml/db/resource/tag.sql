-- Generic HugSQL statements for the relation resource and tags. Bear
-- in mind that the term 'resource' means all resources of the
-- platform which includes: Policy, Technology, Event, Financing,
-- Technical, Action Plan, Organization and Stakeholder. That is, it
-- is not about 'resource' table solely.

-- :name create-resource-tags :<!
-- :doc Creates a relation for <resource>_tag.
INSERT INTO :i:table (:i:resource-col, tag
--~(when (= (:table params) "stakeholder_tag") ", tag_relation_category")
)
VALUES :t*:tags RETURNING *;

-- :name delete-resource-tags :! :n
-- :doc Delete relation for <resource>_tag.
DELETE FROM :i:table WHERE :i:resource-col = :resource-id;

-- :name get-resource-tags :? :*
-- :doc Get resource tags
SELECT rt.:i:resource-col, t.id, t.tag, tg.category AS tag_category
--~(when (= (:table params) "stakeholder_tag") ", rt.tag_relation_category")
FROM :i:table rt
JOIN tag t ON rt.tag = t.id
JOIN tag_category tg ON t.tag_category = tg.id
WHERE rt.:i:resource-col = :resource-id
AND t.review_status = 'APPROVED';
