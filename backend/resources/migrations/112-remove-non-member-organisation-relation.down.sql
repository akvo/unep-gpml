CREATE TABLE non_member_organisation (
    id integer NOT NULL PRIMARY KEY,
    name text NOT NULL,
    created timestamp with time zone DEFAULT now(),
    modified timestamp with time zone DEFAULT now(),
    country integer,
    subnational_area_only text,
    geo_coverage_type public.geo_coverage_type
);

CREATE TABLE non_member_organisation_geo_coverage (
    id integer NOT NULL PRIMARY KEY,
    non_member_organisation integer NOT NULL,
    country_group integer,
    country integer,
    CONSTRAINT check_country_or_group_not_null CHECK ((num_nonnulls(country_group, country) = 1))
);

ALTER TABLE stakeholder ADD column non_member_organisation integer REFERENCES non_member_organisation(id);
