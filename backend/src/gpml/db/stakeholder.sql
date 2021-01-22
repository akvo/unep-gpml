-- :name all-stakeholder :? :*
-- :doc Get all stakeholder
select * from stakeholder order by id;

-- :name stakeholder-by-email :? :1
-- :doc Get stakeholder by email
select * from stakeholder where email = :email;

-- :name stakeholder-set-role :!
-- :doc Set stakeholder role
update stakeholder set role = :v:role::stakeholder_role where id = :id;

-- :name stakeholder-approve :!
-- :doc Approve stakeholder
update stakeholder set approved_at = now()::timestamptz where id = :id;

-- :name new-stakeholder :<!
-- :doc Insert a new stakeholder (Temporary pre-approved by default)
insert into stakeholder(picture, title, first_name, last_name, affiliation, email, linkedin, twitter, url, country, representation, summary, geo_coverage_type, approved_at)
values(:picture, :title, :first_name, :last_name, :affiliation, :email, :linkedin, :twitter, :url, :country::integer, :representation, :summary, :v:geo_coverage_type::geo_coverage_type, now()) RETURNING id;
