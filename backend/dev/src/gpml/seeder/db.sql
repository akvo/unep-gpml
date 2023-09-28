-- :name get-foreign-key :? :1
select
    u.table_name || '_id_seq' as tbl_seq,
    u.table_name as tbl,
    json_agg(json_build_object(
            'tbl', r.table_name,
            'cons', r.constraint_name,
            'col', r.column_name,
            'tbl_ref', u.table_name)) as deps
from information_schema.constraint_column_usage u
inner join information_schema.referential_constraints fk
    on u.constraint_catalog = fk.unique_constraint_catalog
    and u.constraint_schema = fk.unique_constraint_schema
    and u.constraint_name = fk.unique_constraint_name
inner join information_schema.key_column_usage r
    on r.constraint_catalog = fk.constraint_catalog
    and r.constraint_schema = fk.constraint_schema
    and r.constraint_name = fk.constraint_name
where u.column_name = 'id'
  and u.table_name = :table
GROUP BY tbl, tbl_seq

-- :name update-foreign-value :? :*
update :i:tbl
set :i:col = :new_id
where :i:col = :old_id
--~ (when (:exclude params) "AND id NOT IN (:v*:exclude)")
returning id;

-- :name get-count :? :1
select count(*) from :i:tbl

-- :name drop-constraint :! :1
ALTER TABLE :i:tbl
DROP CONSTRAINT IF EXISTS :i:cons

-- :name add-constraint :! :1
ALTER TABLE :i:tbl
ADD CONSTRAINT :i:cons
FOREIGN KEY (:i:col)
REFERENCES :i:tbl_ref

-- :name delete-rows :! :n
DELETE FROM :i:tbl
WHERE :i:col in (:v*:ids)

-- :name set-sequence :!
SELECT setval(:tbl_seq, (SELECT max(id) + 1 FROM :i:tbl));
