CREATE TABLE initiative (
  id serial NOT NULL PRIMARY KEY,
  uuid text,
  version integer NOT NULL,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  created_by integer REFERENCES stakeholder(id),
  reviewed_at timestamptz,
  reviewed_by integer REFERENCES stakeholder(id),
  review_status review_status DEFAULT 'SUBMITTED',
  q1 jsonb,
  q2 jsonb,
  q3 jsonb,
  q4 jsonb,
  q4_1_1 jsonb,
  q4_1_2 jsonb,
  q4_2_1 jsonb,
  q4_2_2 jsonb,
  q4_3_1 jsonb,
  q4_3_2 jsonb,
  q4_4_1 jsonb,
  q4_4_2 jsonb,
  q4_4_3 jsonb,
  q4_4_4 jsonb,
  q4_4_5 jsonb,
  q5 jsonb,
  q6 jsonb,
  q7 jsonb,
  q7_1_0 jsonb,
  q7_1_1 jsonb,
  q7_1_2 jsonb,
  q7_2 jsonb,
  q7_3 jsonb,
  q8 jsonb,
  q9 jsonb,
  q10 jsonb,
  q11 jsonb,
  q12 jsonb,
  q13 jsonb,
  q14 jsonb,
  q15 jsonb,
  q16 jsonb,
  q17 jsonb,
  q18 jsonb,
  q19 jsonb,
  q20 jsonb,
  q21 jsonb,
  q22 jsonb,
  q23 jsonb,
  q24 jsonb,
  q24_1 jsonb,
  q24_2 jsonb,
  q24_3 jsonb,
  q24_4 jsonb,
  q24_5 jsonb,
  q26 jsonb,
  q27 jsonb,
  q28 jsonb,
  q29 jsonb,
  q30 jsonb,
  q31 jsonb,
  q32 jsonb,
  q33 jsonb,
  q34 jsonb,
  q35 jsonb,
  q36 jsonb,
  q36_1 jsonb,
  q37 jsonb,
  q37_1 jsonb,
  q38 jsonb,
  q39 jsonb,
  q40 jsonb,
  q41 jsonb,
  q41_1 jsonb
);
