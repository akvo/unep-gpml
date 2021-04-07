-- :name all
-- :doc Get all archved contents
WITH archived AS (
    SELECT 'profile' AS type, CONCAT(title, '. ', last_name,' ', first_name) as title, review_status, reviewed_at, reviewed_by, null as created_by
    FROM stakeholder
    WHERE review_status <> 'SUBMITTED'
    UNION
    SELECT 'event' AS type, title, review_status, reviewed_at, reviewed_by, created_by
    FROM event where review_status <> 'SUBMITTED'
    ORDER BY reviewed_at DESC NULLS LAST
)
SELECT a.type, a.title, a.review_status, CONCAT(s.first_name,' ', s.last_name) AS reviewed_by, TO_CHAR(a.reviewed_at, 'DD/MM/YYYY HH12:MI pm') as reviewed_at, c.email as created_by
FROM archived a
LEFT JOIN stakeholder s ON s.id = a.reviewed_by
LEFT JOIN stakeholder c ON c.id = a.created_by;
