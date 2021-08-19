-- :name all-reviews :? :*
-- :doc Get all reviews
SELECT * FROM review ORDER BY id;

-- :name reviews-by-reviewer-id :? :*
-- :doc Get reviews for reviewer
SELECT * FROM review
WHERE reviewer = :reviewer
--~ (when (seq (:review-status params)) "AND review_status = ANY(ARRAY[:v*:review-status]::reviewer_review_status[])")
ORDER BY id
LIMIT :limit
OFFSET :limit * (:page - 1);

-- :name count-by-reviewer-id :? :1
-- :doc Get reviews for reviewer
SELECT COUNT(*) FROM review
WHERE reviewer = :reviewer
--~ (when (seq (:review-status params)) "AND review_status = ANY(ARRAY[:v*:review-status]::reviewer_review_status[])")

-- :name review-by-id :? :1
-- :doc Get review by id
SELECT * FROM review WHERE id = :id;

-- :name review-by-topic-item :? :1
-- :doc Get review by topic_type, topic_id
SELECT * FROM review WHERE
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
