CREATE OR REPLACE VIEW v_initiative_tag AS
  SELECT i.id, json_agg(tag_text) AS tags
  FROM initiative i
  JOIN jsonb_array_elements(q32) tag_elements ON true
  JOIN jsonb_each_text(tag_elements) tag_text ON true
  GROUP BY i.id;
