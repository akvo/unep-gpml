-- :name create-case-studies :returning-execute :many
-- :doc Create new case studies
insert into case_study (:i*:insert-cols)
values :t*:insert-values returning id;

-- :name get-case-studies-files-to-migrate :query :many
WITH case_study_files AS (
	SELECT id, 'image' AS file_type, 'images' AS file_key, image AS content
	FROM case_study
	WHERE image NOT LIKE 'https://storage.googleapis.com/%'
	AND image IS NOT NULL
	AND image_id IS NULL
	UNION
	SELECT id, 'thumbnail' AS file_type, 'images' AS file_key, thumbnail AS content
	FROM case_study
	WHERE thumbnail NOT LIKE 'https://storage.googleapis.com/%'
	AND thumbnail IS NOT NULL
	AND thumbnail_id IS NULL
)
SELECT *
FROM case_study_files
ORDER BY id
--~ (when (:limit params) " LIMIT :limit")
;

-- :name update-case-study :execute :affected
-- :doc this query is for file migration purposes and will be removed.
UPDATE case_study
SET
/*~
(str/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :updates." (name field))))
~*/
WHERE id = :id;
