-- :name all-stakeholder :? :*
-- :doc Get all stakeholder
select * from stakeholder order by id;

-- :name stakeholder-by-email :? :1
-- :doc Get stakeholder by email
select * from stakeholder where email = :email;

-- :name new-stakeholder :<!
-- :doc Insert a new stakeholder
insert into stakeholder(picture, title, first_name, last_name, affiliation, email, linkedin, twitter, url, country, representation, summary, geo_coverage_type)
values(:picture, :title, :first_name, :last_name, :affiliation, :email, :linkedin, :twitter, :url, :country::integer, :representation, :summary, :geo_coverage_type) RETURNING id;
