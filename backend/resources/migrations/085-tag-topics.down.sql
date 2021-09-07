DELETE FROM project_tag WHERE id = (SELECT t.id from project_tag t JOIN tag ON tag.tag = 'product by design' where t.project = 277 AND t.tag = tag.id);

DELETE FROM policy_tag WHERE id = (SELECT t.id from policy_tag t JOIN tag ON tag.tag = 'product by design' where t.policy = 46 AND t.tag = tag.id);

DELETE FROM resource_tag WHERE id = (
  SELECT t.id from resource_tag t
  JOIN tag ON tag.tag = 'marine litter'
  JOIN tag_category tc ON tc.category = 'topics'
  WHERE t.resource = 46 AND t.tag = tag.id AND tc.id = tag.tag_category
);

DELETE FROM resource_tag WHERE id = (SELECT t.id from resource_tag t JOIN tag ON tag.tag = 'capacity building' where t.resource = 8 AND t.tag = tag.id);

DELETE FROM resource_tag WHERE id = (SELECT t.id from resource_tag t JOIN tag ON tag.tag = 'capacity building' where t.resource = 36 AND t.tag = tag.id);

DELETE FROM project_tag WHERE id = (SELECT t.id from project_tag t JOIN tag ON tag.tag = 'capacity building' where t.project = 89 AND t.tag = tag.id);

DELETE FROM project_tag WHERE id = (SELECT t.id from project_tag t JOIN tag ON tag.tag = 'capacity building' where t.project = 298 AND t.tag = tag.id);

DELETE FROM event_tag WHERE id = (SELECT t.id from event_tag t JOIN tag ON tag.tag = 'capacity building' where t.event = 36 AND t.tag = tag.id);

DELETE FROM resource_tag WHERE id = (SELECT t.id from resource_tag t JOIN tag ON tag.tag = 'plastics' where t.resource = 87 AND t.tag = tag.id);
