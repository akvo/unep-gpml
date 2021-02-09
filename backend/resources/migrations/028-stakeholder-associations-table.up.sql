CREATE TYPE stakeholder_association AS
ENUM ('interested in', 'other');
-- ;;

CREATE TABLE stakeholder_stakeholder (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  other_stakeholder integer NOT NULL REFERENCES stakeholder(id),
  association stakeholder_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, other_stakeholder, association)
);
-- ;;
