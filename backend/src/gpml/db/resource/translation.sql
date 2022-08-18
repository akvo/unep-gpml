-- :name create-or-update-translations :execute :many
-- :doc Upsert multiple translations for a target resource.
INSERT INTO :i:table (:i*:insert-cols)
  VALUES :t*:translations
  ON CONFLICT (:i:resource-col, translatable_field, language)
  DO UPDATE SET value = excluded.value;
