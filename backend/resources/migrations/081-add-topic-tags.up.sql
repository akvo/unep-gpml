WITH tc AS (
  INSERT INTO tag_category (category) VALUES ('topics') RETURNING id
)
INSERT INTO tag (tag_category, tag)
VALUES
  ((SELECT id from tc), 'product by design'),
  ((SELECT id from tc), 'waste management'),
  ((SELECT id from tc), 'plastics'),
  ((SELECT id from tc), 'marine litter'),
  ((SELECT id from tc), 'capacity building'),
  ((SELECT id from tc), 'source-to-sea');
