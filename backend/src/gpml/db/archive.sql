-- :name pages :? :1
-- :doc Get paginated archived contents
WITH
archived AS (
    SELECT 'profile' AS type, CONCAT(title, '. ', last_name,' ', first_name) as title, review_status, reviewed_at, reviewed_by, null as created_by
    FROM stakeholder
    WHERE review_status <> 'SUBMITTED'
    UNION
    SELECT 'event' AS type, title, review_status, reviewed_at, reviewed_by, created_by
    FROM event where review_status <> 'SUBMITTED'
    UNION
    SELECT 'technology' as type, name as title, review_status, reviewed_at, reviewed_by, created_by
    FROM technology where review_status <> 'SUBMITTED'
    UNION
    SELECT 'policy' as type, original_title as title, review_status, reviewed_at, reviewed_by, created_by
    FROM policy where review_status <> 'SUBMITTED'
    UNION
    SELECT type, title, review_status, reviewed_at, reviewed_by, created_by
    FROM resource where review_status <> 'SUBMITTED'
    ORDER BY reviewed_at DESC NULLS LAST
),
data AS (
    SELECT a.type, a.title, a.review_status, CONCAT(s.first_name,' ', s.last_name) AS reviewed_by, TO_CHAR(a.reviewed_at, 'DD/MM/YYYY HH12:MI pm') as reviewed_at, c.email as created_by
    FROM archived a
    LEFT JOIN stakeholder s ON s.id = a.reviewed_by
    LEFT JOIN stakeholder c ON c.id = a.created_by
    LIMIT :limit
    OFFSET :limit * (:page - 1)
)
SELECT json_build_object(
    'data', (select json_agg(row_to_json(data)) from data),
    'count', (SELECT COUNT(*) FROM archived),
    'page', :page,
    'pages', (SELECT COUNT(*) FROM archived) / :limit,
    'limit', :limit) as result;

