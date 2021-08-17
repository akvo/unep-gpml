WITH tc AS (
  SELECT * FROM tag_category tc WHERE category = 'topics'
)
  DELETE FROM tag
    USING tc
    WHERE tag_category = tc.id;

DELETE FROM tag_category WHERE category = 'topics';
