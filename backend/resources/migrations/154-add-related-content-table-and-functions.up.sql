BEGIN;
--;;
CREATE OR REPLACE FUNCTION resource_record_exists(_tbl regclass, id integer)
RETURNS boolean
AS $$
DECLARE
     v boolean;
BEGIN
     EXECUTE 'SELECT (EXISTS (SELECT FROM ' || _tbl || ' WHERE id = $1))'
     INTO v
     USING id;
     RETURN v;
END;
$$ LANGUAGE plpgsql;
--;;
CREATE OR REPLACE FUNCTION get_related_content(src_tbl regclass, src_tbl_id integer)
RETURNS TABLE (resource_type TEXT, resource_data JSON)
AS $$
DECLARE
  rec RECORD;
  resource_type_col TEXT;
BEGIN
  FOR rec IN
    SELECT related_resource_table_name, array_agg(related_resource_id) AS related_resources_ids
    FROM related_content
    WHERE resource_table_name = src_tbl AND resource_id = src_tbl_id
    GROUP BY related_resource_table_name
  LOOP
    resource_type_col = quote_literal(rec.related_resource_table_name) || ' AS resource_type';
    RETURN QUERY EXECUTE format('SELECT %s, row_to_json(r.*) AS resource_data FROM %I r WHERE r.id = ANY(%L::int[])',
                                 resource_type_col,
                                 rec.related_resource_table_name,
                                 rec.related_resources_ids);

  END LOOP;
END
$$ language plpgsql;
--;;
CREATE TABLE related_content(
       resource_id INTEGER NOT NULL,
       resource_table_name REGCLASS NOT NULL,
       related_resource_id INTEGER NOT NULL,
       related_resource_table_name REGCLASS NOT NULL
);
--;;
ALTER TABLE related_content
ADD CONSTRAINT related_content_pk PRIMARY KEY (resource_id, resource_table_name, related_resource_id, related_resource_table_name),
ADD CONSTRAINT related_content_resource_id_table_name CHECK (resource_record_exists(resource_table_name, resource_id)),
ADD CONSTRAINT related_content_related_resource_id_table_name CHECK (resource_record_exists(related_resource_table_name, related_resource_id));
--;;
INSERT INTO related_content
SELECT id AS resource_id, 'event' AS resource_table_name, unnest(related_content) AS related_resource_id, 'event' AS related_resource_table_name
FROM event
WHERE related_content IS NOT NULL;
--;;
INSERT INTO related_content
SELECT id AS resource_id, 'policy' AS resource_table_name, unnest(related_content) AS related_resource_id, 'policy' AS related_resource_table_name
FROM policy
WHERE related_content IS NOT NULL;
--;;
INSERT INTO related_content
SELECT id AS resource_id, 'technology' AS resource_table_name, unnest(related_content) AS related_resource_id, 'technology' AS related_resource_table_name
FROM technology
WHERE related_content IS NOT NULL;
--;;
INSERT INTO related_content
SELECT id AS resource_id, 'initiative' AS resource_table_name, unnest(related_content) AS related_resource_id, 'initiative' AS related_resource_table_name
FROM initiative
WHERE related_content IS NOT NULL;
--;;
INSERT INTO related_content
SELECT id AS resource_id, 'resource' AS resource_table_name, unnest(related_content) AS related_resource_id, 'resource' AS related_resource_table_name
FROM resource
WHERE related_content IS NOT NULL;
--;;
ALTER TABLE event
DROP COLUMN related_content;
--;;
ALTER TABLE policy
DROP COLUMN related_content;
--;;
ALTER TABLE technology
DROP COLUMN related_content;
--;;
ALTER TABLE initiative
DROP COLUMN related_content;
--;;
ALTER TABLE resource
DROP COLUMN related_content;
--;;
COMMIT;
