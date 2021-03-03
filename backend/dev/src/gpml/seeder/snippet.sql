-- :name drop-constraint :! :1
ALTER TABLE :i:table
DROP CONSTRAINT IF EXISTS :i:key

-- :name add-constraint :! :1
ALTER TABLE :i:table
ADD CONSTRAINT :i:key
FOREIGN KEY --~(str "(" ":i:column" ")")
REFERENCES --~(str ":i:target" "(id)")

-- :name truncate :! :1
TRUNCATE TABLE :i:table

-- :name dissoc-sequence :! :1
ALTER TABLE :i:table
ALTER COLUMN id DROP DEFAULT

-- :name get-last-id :? :1
SELECT id FROM :i:table
ORDER BY id DESC;

-- :name set-sequence :!
SELECT setval(:seq, (SELECT max(id) + 1 FROM :i:table));
