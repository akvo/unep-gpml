-- :name all-reviews :? :*
-- :doc Get all reviews
SELECT * FROM review ORDER BY id;

-- :name reviews-by-reviewer-id :? :*
-- :doc Get reviews for reviewer
SELECT r.*, (CASE
  WHEN r.topic_type = 'initiative' THEN (SELECT TRIM('"' FROM t.q2::text) FROM initiative t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'technology' THEN (SELECT t.name FROM technology t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'resource' THEN (SELECT t.title FROM resource t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'event' THEN (SELECT t.title FROM event t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'policy' THEN (SELECT t.title FROM policy t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'organisation' THEN (SELECT t.name FROM organisation t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'stakeholder' THEN (SELECT CONCAT(title, '. ', last_name,' ', first_name) FROM stakeholder t WHERE t.id = r.topic_id)
END) AS title,
(CASE
  WHEN r.topic_type = 'initiative' THEN 'project'
  WHEN r.topic_type = 'resource' THEN (SELECT REPLACE(LOWER(t.type), ' ', '_') FROM resource t WHERE t.id = r.topic_id)
  ELSE r.topic_type::text
END) AS type
FROM review r
WHERE reviewer = :reviewer
--~ (when (seq (:review-status params)) "AND review_status = ANY(ARRAY[:v*:review-status]::reviewer_review_status[]) ")
--~ (when (= "stakeholders" (:only params)) "AND topic_type IN ('stakeholder', 'organisation') ")
--~ (when (= "resources" (:only params)) "AND topic_type NOT IN ('stakeholder', 'organisation') ")
ORDER BY id
LIMIT :limit
OFFSET :limit * (:page - 1);

-- :name count-by-reviewer-id :? :1
-- :doc Get reviews for reviewer
SELECT COUNT(*) FROM review
WHERE reviewer = :reviewer
--~ (when (seq (:review-status params)) "AND review_status = ANY(ARRAY[:v*:review-status]::reviewer_review_status[]) ")
--~ (when (= "stakeholders" (:only params)) "AND topic_type IN ('stakeholder', 'organisation') ")
--~ (when (= "resources" (:only params)) "AND topic_type NOT IN ('stakeholder', 'organisation') ")

-- :name review-by-id :? :1
-- :doc Get review by id
SELECT * FROM review WHERE id = :id;

-- :name review-by-topic-item :? :1
-- :doc Get review by topic_type, topic_id
SELECT r.*, (CASE
  WHEN r.topic_type = 'initiative' THEN (SELECT TRIM('"' FROM t.q2::text) FROM initiative t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'technology' THEN (SELECT t.name FROM technology t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'resource' THEN (SELECT t.title FROM resource t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'event' THEN (SELECT t.title FROM event t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'policy' THEN (SELECT t.title FROM policy t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'organisation' THEN (SELECT t.name FROM organisation t WHERE t.id = r.topic_id)
  WHEN r.topic_type = 'stakeholder' THEN (SELECT CONCAT(title, '. ', last_name,' ', first_name) FROM stakeholder t WHERE t.id = r.topic_id)
END) AS title
FROM review r
WHERE
  topic_type = :v:topic-type::topic_type AND
  topic_id = :topic-id;

-- :name new-review :<! :1
INSERT INTO review (topic_type, topic_id, assigned_by, reviewer)
VALUES (:topic-type::topic_type, :topic-id, :assigned-by, :reviewer) returning id;

-- :name update-review-status :<! :1
UPDATE review SET
  review_status = :review-status::reviewer_review_status,
  review_comment = :review-comment
  WHERE id = :id RETURNING id;

-- :name change-reviewer :<! :1
UPDATE review SET
  assigned_by = :assigned-by,
  reviewer = :reviewer
    WHERE id = :id
    RETURNING id;
