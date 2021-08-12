-- :name all-reviews :? :*
-- :doc Get all reviews
SELECT * FROM review ORDER BY id

-- :name review-by-id :? :1
-- :doc Get review by id
SELECT * FROM review WHERE id = :id;

-- :name review-by-topic-item :? :1
-- :doc Get review by topic_name, topic_id
SELECT * FROM review WHERE
  topic_name = :v:topic-name::topic_name AND
  topic_id = :topic-id;

-- :name new-review :<! :1
INSERT INTO review (topic_name, topic_id, assigned_by, reviewer)
VALUES (:topic-name::topic_name, :topic-id, :assigned-by, :reviewer) returning id;

-- :name change-reviewer :<! :1
UPDATE review SET
  assigned_by = :assigned-by,
  assigned = now(),
  reviewer = :reviewer
    WHERE id = :id
    RETURNING id;

-- :name update-review :<! :1
UPDATE review SET
  review_status = :review-status::reviewer_review_status,
  review_comment = :review-comment
  WHERE id = :id RETURNING id;
