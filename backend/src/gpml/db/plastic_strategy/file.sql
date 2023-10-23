-- :name create-ps-file* :execute :affected
INSERT INTO plastic_strategy_file(plastic_strategy_id, file_id, section_key)
VALUES(:plastic-strategy-id, :file-id, :section-key);

-- :name delete-ps-file* :execute :affected
DELETE FROM plastic_strategy_file
WHERE plastic_strategy_id = :plastic-strategy-id
      AND file_id = :file-id
      AND section_key = :section-key;

-- :name get-ps-files* :query :many
SELECT psf.plastic_strategy_id, psf.section_key, f.*
FROM plastic_strategy_file psf
JOIN file f ON psf.file_id = f.id
WHERE 1=1
--~(when (seq (get-in params [:filters :plastic-strategies-ids])) " AND psf.plastic_strategy_id IN (:v*:filters.plastic-strategies-ids)")
--~(when (seq (get-in params [:filters :files-ids])) " AND psf.file_id IN (:v*:filters.files-ids)")
--~(when (seq (get-in params [:filters :sections-keys])) " AND psf.section_key IN (:v*:filters.sections-keys)")
;
