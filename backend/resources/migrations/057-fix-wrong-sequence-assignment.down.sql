ALTER TABLE country ALTER COLUMN id SET DEFAULT nextval('country');
ALTER TABLE country_group ALTER COLUMN id SET DEFAULT nextval('country_group');
ALTER TABLE organisation ALTER COLUMN id SET DEFAULT nextval('organisation');
ALTER TABLE event ALTER COLUMN id SET DEFAULT nextval('event');
ALTER TABLE policy ALTER COLUMN id SET DEFAULT nextval('policy');
ALTER TABLE technology ALTER COLUMN id SET DEFAULT nextval('technology');
ALTER TABLE resource ALTER COLUMN id SET DEFAULT nextval('resource');
ALTER TABLE project ALTER COLUMN id SET DEFAULT nextval('project');
