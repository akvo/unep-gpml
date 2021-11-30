ALTER TABLE review DROP CONSTRAINT review_topic_type_topic_id_reviewer_key;
ALTER TABLE review ADD CONSTRAINT review_topic_type_topic_id_key UNIQUE (topic_type, topic_id);
