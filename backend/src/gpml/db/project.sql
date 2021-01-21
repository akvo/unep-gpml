-- :name new-project :<!
-- :doc Insert a new projects
insert into project(uuid, phase, contribution, funds)
values(:uuid, :phase, :contribution, :funds) returning id;

-- :name new-project-country :<!
-- :doc Insert a new coutry projects
insert into project_country(project, country)
values(:project, :country);

-- :name new-project-action :<!
-- :doc Insert a new project actions
insert into project_action(project, action)
values(:project, :action);

-- :name new-project-action-detail :<!
-- :doc Insert a new projects action details
insert into project_action_detail(project, action_detail, value)
values(:project, :action_detail, :value);
