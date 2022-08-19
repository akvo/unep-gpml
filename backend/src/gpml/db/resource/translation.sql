-- :name create-or-update-translations :execute :many
-- :doc Upsert multiple translations for a target resource.
INSERT INTO :i:table (:i*:insert-cols)
  VALUES :t*:translations
  ON CONFLICT (:i:resource-col, translatable_field, language)
  DO UPDATE SET value = excluded.value;

-- :name get-resource-translation-langs :query :many
-- :doc Get all the translation languages available for a given resource.
SELECT DISTINCT language
  FROM :i:table
  WHERE :i:resource-col = :filters.resource-id;

-- :name get-resource-translations :query :many
-- :doc Get all the translations available for a given resource.
SELECT :i:resource-col,
       translatable_field,
       json_object_agg(language, value) AS translations
  FROM :i:table
  WHERE :i:resource-col = :filters.resource-id
  GROUP BY (:i:resource-col, translatable_field);

-- :name delete-resource-translations :execute :many
-- :doc Remove translations specified with filters for a target resource.
DELETE FROM :i:table
  WHERE :i:resource-col = :filters.resource-id
--~(when (seq (get-in params [:filters :translations])) " AND (language, translatable_field) IN (:t*:filters.translations)")
--~(when (and (not (seq (get-in params [:filters :translations]))) (seq (get-in params [:filters :languages]))) " AND language IN (:v*:filters.languages)")
--~(when (and (not (seq (get-in params [:filters :translations]))) (seq (get-in params [:filters :translatable_fields]))) " AND translatable_field IN (:v*:filters.translatable_fields)")
