INSERT INTO project_tag (project, tag)
VALUES (277, (SELECT id from tag WHERE tag = 'product by design'));

INSERT INTO policy_tag (policy, tag)
VALUES (46, (SELECT id from tag WHERE tag = 'product by design'));

INSERT INTO resource_tag (resource, tag)
VALUES
(56,
 (SELECT tag.id from tag
  JOIN tag_category tc ON tc.category = 'topics'
   WHERE tag = 'marine litter' AND tc.id = tag.tag_category)
);

INSERT INTO resource_tag (resource, tag)
VALUES
(8, (SELECT id from tag WHERE tag = 'capacity building')),
(36, (SELECT id from tag WHERE tag = 'capacity building'));

INSERT INTO project_tag (project, tag)
VALUES
(89, (SELECT id from tag WHERE tag = 'capacity building')),
(298, (SELECT id from tag WHERE tag = 'capacity building'));

INSERT INTO event_tag (event, tag)
VALUES (36, (SELECT id from tag WHERE tag = 'capacity building'));

INSERT INTO resource_tag (resource, tag)
VALUES (87, (SELECT id from tag WHERE tag = 'plastics'));
