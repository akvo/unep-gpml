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
