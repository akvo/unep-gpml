-- :name new-project :<! :1
-- :doc Insert a new projects
insert into project(uuid, phase, contribution, funds, title, summary, geo_coverage_type, review_status)
values(:uuid, :phase, :contribution, :funds, :title, :summary, :v:geo_coverage_type::geo_coverage_type, :v:review_status::review_status) returning id;

-- :name new-project-country :<! :1
-- :doc Insert a new coutry projects
insert into project_country(project, country)
values(:project, :country);

-- :name new-project-action :<! :1
-- :doc Insert a new project actions
insert into project_action(project, action)
values(:project, :action);

-- :name new-project-action-detail :<! :1
-- :doc Insert a new projects action details
insert into project_action_detail(project, action_detail, value)
values(:project, :action_detail, :value);
