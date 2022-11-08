-- :name create-case-studies :returning-execute :many
-- :doc Create new case studies
insert into case_study (:i*:insert-cols)
values :t*:insert-values returning id;