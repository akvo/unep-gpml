-- Generic HugSQL statements for the relation resource and tags. Bear
-- in mind that the term 'resource' means all resources of the
-- platform which includes: Policy, Technology, Event, Financing,
-- Technical, Action Plan, Organization and Stakeholder. That is, it
-- is not about 'resource' table solely.

-- :name create-resource-tags :<!
-- :doc Creates a relation for <resource>_tag.
INSERT INTO :i:table (:i:resource-col, tag)
VALUES :t*:tags RETURNING *;
