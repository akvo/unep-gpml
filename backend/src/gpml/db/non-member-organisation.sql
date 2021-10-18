-- :name all-non-member-organisations :? :*
-- :doc Get all non member organisations
select id, name from non_member_organisation order by id;


-- :name new-non-member-organisation :<! :1
insert into non_member_organisation (
    name
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :subnational_area_only) ", subnational_area_only")
--~ (when (contains? params :geo_coverage_type) ", geo_coverage_type")
)
values (
    :name
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :subnational_area_only) ", :subnational_area_only")
--~ (when (contains? params :geo_coverage_type) ", :geo_coverage_type::geo_coverage_type")
) returning id;


-- :name add-geo-coverage :<! :1
-- :doc add non-memnber-organisation geo coverage
insert into non_member_organisation_geo_coverage(non_member_organisation, country_group, country)
values :t*:geo RETURNING id;
