-- :name new-project :<! :1
-- :doc Insert a new projects
insert into project(
    uuid,
    phase,
    contribution,
    funds,
    title,
    summary,
    url,
    geo_coverage_type,
    review_status,
    image
--~ (when (contains? params :id) ", id")
)
values(
    :uuid,
    :phase,
    :contribution,
    :funds,
    :title,
    :summary,
    :url,
    :v:geo_coverage_type::geo_coverage_type,
    :v:review_status::review_status,
    :image
--~ (when (contains? params :id) ", :id")
)
returning id;

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

-- :name project-actions-id :? :*
select action from project_action where project = :id

-- :name project-actions-details :? :*
select action_detail,value from project_action_detail where project = :id
