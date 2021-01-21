-- :name filter-resource :? :*
-- :doc Filter resources
SELECT *, to_tsvector('english', coalesce(title, '') || ' ' ||
                      coalesce(summary, '') || ' '|| coalesce(remarks, '')) AS search_text

-- :name filter-policy :? :*
-- :doc Filter policies
SELECT *, to_tsvector('english', coalesce(title, '')    || ' ' || coalesce(original_title, '') || '' ||
                      coalesce(abstract, '') || ' ' || coalesce(remarks, '')) AS search_text
FROM policy

-- :name filter-event :? :*
-- :doc Filter events
SELECT *, to_tsvector('english', coalesce(title, '') || ' ' ||
          coalesce(description, '') || ' ' || coalesce(remarks, '')) AS search_text
FROM event

-- :name filter-technology :? :*
SELECT *, to_tsvector('english', name) AS search_text
FROM technology

-- :name filter-people :? :*
SELECT *, to_tsvector('english', summary) as search_text
FROM stakeholder

-- :name filter-project :? :*
SELECT 1
