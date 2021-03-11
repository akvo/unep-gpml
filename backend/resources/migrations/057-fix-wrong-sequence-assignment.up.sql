ALTER TABLE country ALTER COLUMN id SET DEFAULT nextval('country_id_seq');
ALTER TABLE country_group ALTER COLUMN id SET DEFAULT nextval('country_group_id_seq');
ALTER TABLE organisation ALTER COLUMN id SET DEFAULT nextval('organisation_id_seq');
ALTER TABLE event ALTER COLUMN id SET DEFAULT nextval('event_id_seq');
ALTER TABLE policy ALTER COLUMN id SET DEFAULT nextval('policy_id_seq');
ALTER TABLE technology ALTER COLUMN id SET DEFAULT nextval('technology_id_seq');
ALTER TABLE resource ALTER COLUMN id SET DEFAULT nextval('resource_id_seq');
ALTER TABLE project ALTER COLUMN id SET DEFAULT nextval('project_id_seq');
