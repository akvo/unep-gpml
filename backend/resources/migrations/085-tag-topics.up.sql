INSERT INTO project_tag (project, tag)
SELECT 277, id FROM tag
WHERE
  tag = 'product by design' AND
  EXISTS (SELECT id from project where id = 277) AND
  NOT EXISTS (SELECT pt.id from project_tag pt JOIN tag ON tag.tag = 'product by design' where pt.project = 277 AND pt.tag = tag.id);

INSERT INTO policy_tag (policy, tag)
SELECT 46, id FROM tag
WHERE
  tag = 'product by design' AND
  EXISTS (SELECT id from policy where id = 46) AND
  NOT EXISTS (SELECT pt.id from policy_tag pt JOIN tag ON tag.tag = 'product by design' where pt.policy = 46 AND pt.tag = tag.id);

INSERT INTO resource_tag (resource, tag)
SELECT 56, tag.id from tag JOIN tag_category tc ON tc.category = 'topics'
WHERE
  tag = 'marine litter' AND tc.id = tag.tag_category AND
  EXISTS (SELECT id from resource where id = 56) AND
  NOT EXISTS (SELECT pt.id from resource_tag pt JOIN tag ON tag.tag = 'marine litter' where pt.resource = 56 AND pt.tag = tag.id);

INSERT INTO resource_tag (resource, tag)
SELECT 8, id FROM tag
WHERE
  tag = 'capacity building' AND
  EXISTS (SELECT id from resource where id = 8) AND
  NOT EXISTS (SELECT pt.id from resource_tag pt JOIN tag ON tag.tag = 'capacity building' where pt.resource = 8 AND pt.tag = tag.id);

INSERT INTO resource_tag (resource, tag)
SELECT 36, id FROM tag
WHERE
  tag = 'capacity building' AND
  EXISTS (SELECT id from resource where id = 36) AND
  NOT EXISTS (SELECT pt.id from resource_tag pt JOIN tag ON tag.tag = 'capacity building' where pt.resource = 36 AND pt.tag = tag.id);

INSERT INTO project_tag (project, tag)
SELECT 89, id FROM tag
WHERE
  tag = 'capacity building' AND
  EXISTS (SELECT id from project where id = 89) AND
  NOT EXISTS (SELECT pt.id from project_tag pt JOIN tag ON tag.tag = 'capacity building' where pt.project = 89 AND pt.tag = tag.id);

INSERT INTO project_tag (project, tag)
SELECT 298, id FROM tag
WHERE
  tag = 'capacity building' AND
  EXISTS (SELECT id from project where id = 298) AND
  NOT EXISTS (SELECT pt.id from project_tag pt JOIN tag ON tag.tag = 'capacity building' where pt.project = 298 AND pt.tag = tag.id);

INSERT INTO event_tag (event, tag)
SELECT 36, id FROM tag
WHERE
  tag = 'capacity building' AND
  EXISTS (SELECT id from event where id = 36) AND
  NOT EXISTS (SELECT pt.id from event_tag pt JOIN tag ON tag.tag = 'capacity building' where pt.event = 36 AND pt.tag = tag.id);

INSERT INTO resource_tag (resource, tag)
SELECT 87, id FROM tag
WHERE
  tag = 'plastics' AND
  EXISTS (SELECT id from resource where id = 87) AND
  NOT EXISTS (SELECT pt.id from resource_tag pt JOIN tag ON tag.tag = 'plastics' where pt.resource = 87 AND pt.tag = tag.id);
