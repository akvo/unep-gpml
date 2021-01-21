-- :name all-languages :? :*
-- :doc Get all languages
select * from language order by id

-- :name language-by-name :? :1
-- :doc Get language by name
select * from language where english_name = :name

-- :name new-language :!
-- :doc Insert new language
insert into language (english_name, native_name, iso_code)
values(:english_name, :native_name, :iso_code)
