-- :name pages :? :1
-- :doc Get paginated submission contents
WITH
submission AS (
    SELECT id, 'stakeholder' AS type, 'stakeholder' AS topic, CONCAT(title, '. ', last_name,' ', first_name) as title, id as created_by, created
    FROM stakeholder
    WHERE review_status = 'SUBMITTED'
    UNION
    SELECT id, 'event' AS type, 'event' AS topic, title, created_by, created
    FROM event where review_status = 'SUBMITTED'
    UNION
    SELECT id, 'technology' AS type, 'technology' AS topic, name as title, created_by, created
    FROM technology where review_status = 'SUBMITTED'
    UNION
    SELECT id, 'policy' AS type, 'policy' AS topic, title, created_by, created
    FROM policy where review_status = 'SUBMITTED'
    UNION
    SELECT id, REPLACE(LOWER(type), ' ', '_') AS type, 'resource' AS topic, title, created_by, created
    FROM resource where review_status = 'SUBMITTED'
    UNION
    SELECT id, 'project' AS type, 'initiative' AS topic, replace(q2::text,'"','') as title, created_by, created
    FROM initiative where review_status = 'SUBMITTED'
),
data AS (
    SELECT s.id, s.type, s.topic, s.title, TO_CHAR(s.created, 'DD/MM/YYYY HH12:MI pm') as created, c.email as created_by, '/submission/' || type || '/' || s.id as preview, COALESCE(r.review_status, 'PENDING') AS review_status, row_to_json(reviewer.*) AS reviewer
    FROM submission s
    LEFT JOIN stakeholder c ON c.id = s.created_by
    LEFT JOIN review r ON r.topic_type = s.topic::topic_type AND r.topic_id = s.id
    LEFT JOIN stakeholder reviewer ON reviewer.id = r.reviewer
    ORDER BY s.created
    LIMIT :limit
    OFFSET :limit * (:page - 1)
)
SELECT json_build_object(
    'data', (select json_agg(row_to_json(data)) from data),
    'count', (SELECT COUNT(*) FROM submission),
    'page', :page,
    'pages', (SELECT COUNT(*) FROM submission) / :limit,
    'limit', :limit) as result;

-- :name detail :? :1
-- :doc get detail of submission
SELECT s.email AS created_by_email, t.*
FROM :i:table-name t
LEFT JOIN stakeholder s ON s.id =
--~ (if (= (:table-name params) "v_stakeholder_data") "t.id" "t.created_by")
WHERE t.id = :id::integer;

-- :name update-submission :! :n
-- :doc approve or reject submission
update :i:table-name
set reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
where id = :id;
