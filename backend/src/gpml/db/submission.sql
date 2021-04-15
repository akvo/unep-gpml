-- :name pages :? :1
-- :doc Get paginated submission contents
WITH
submission AS (
    SELECT id, 'profile' AS type, CONCAT(title, '. ', last_name,' ', first_name) as title, id as created_by, created
    FROM stakeholder
    WHERE review_status = 'SUBMITTED'
    UNION
    SELECT id, 'event' AS type, title, created_by, created
    FROM event where review_status = 'SUBMITTED'
    UNION
    SELECT id, 'technology' as type, name as title, created_by, created
    FROM technology where review_status = 'SUBMITTED'
    UNION
    SELECT id, 'policy' as type, original_title as title, created_by, created
    FROM policy where review_status = 'SUBMITTED'
    UNION
    SELECT id, type, title, created_by, created
    FROM resource where review_status = 'SUBMITTED'
    ORDER BY created
),
data AS (
    SELECT s.id, s.type, s.title, TO_CHAR(s.created, 'DD/MM/YYYY HH12:MI pm') as created, c.email as created_by, '/submission/' || type || '/' || s.id as preview
    FROM submission s
    LEFT JOIN stakeholder c ON c.id = s.created_by
    LIMIT :limit
    OFFSET :limit * (:page - 1)
)
SELECT json_build_object(
    'data', (select json_agg(row_to_json(data)) from data),
    'count', (SELECT COUNT(*) FROM submission),
    'page', :page,
    'pages', (SELECT COUNT(*) FROM submission) / :limit,
    'limit', :limit) as result;

