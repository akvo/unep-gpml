CREATE TABLE technology_like (
  technology_id integer NOT NULL REFERENCES technology (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (technology_id, stakeholder_id)
);
--

CREATE TABLE resource_like (
  resource_id integer NOT NULL REFERENCES resource (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (resource_id, stakeholder_id)
);
--

CREATE TABLE event_like (
  event_id integer NOT NULL REFERENCES event (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (event_id, stakeholder_id)
);
--

CREATE TABLE policy_like (
  policy_id integer NOT NULL REFERENCES policy (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (policy_id, stakeholder_id)
);
--

CREATE TABLE initiative_like (
  initiative_id integer NOT NULL REFERENCES initiative (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (initiative_id, stakeholder_id)
);
--

CREATE TABLE case_study_like (
  case_study_id integer NOT NULL REFERENCES case_study (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (case_study_id, stakeholder_id)
);

--
CREATE TABLE organisation_like (
  organisation_id integer NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  stakeholder_id integer NOT NULL REFERENCES stakeholder (id) ON DELETE CASCADE,
  created timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (organisation_id, stakeholder_id)
);

--
