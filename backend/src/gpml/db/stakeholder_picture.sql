-- :name stakeholder-picture-by-id :? :1
-- :doc Get Stakeholder picture by id
select * from stakeholder_picture where id = :id

-- :name new-stakeholder-picture :<!
-- :doc Insert new Stakeholder picture
insert into stakeholder_picture (picture)
values(:picture) returning id;
