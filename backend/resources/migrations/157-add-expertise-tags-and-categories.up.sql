BEGIN;
--;;
WITH category AS (INSERT INTO tag_category(category) VALUES('environment & biota impact') RETURNING id)
INSERT INTO tag(tag, tag_category, review_status)
VALUES
('ocean & coast', (SELECT id FROM category), 'APPROVED'),
('soil', (SELECT id FROM category), 'APPROVED') ,
('atmosphere', (SELECT id FROM category), 'APPROVED') ,
('ghg emissions', (SELECT id FROM category), 'APPROVED') ,
('natural resources', (SELECT id FROM category), 'APPROVED');

WITH category AS (INSERT INTO tag_category(category) VALUES('socio-economic impact') RETURNING id)
INSERT INTO tag(tag, tag_category, review_status)
VALUES
('behavioural change', (SELECT id FROM category), 'APPROVED') ,
('cost of damage', (SELECT id FROM category), 'APPROVED') ,
('livelihoods', (SELECT id FROM category), 'APPROVED') ,
('quality of life', (SELECT id FROM category), 'APPROVED') ;

WITH category AS (INSERT INTO tag_category(category) VALUES('life cycle & safe circularity') RETURNING id)
INSERT INTO tag(tag, tag_category, review_status)
VALUES
('consumption', (SELECT id FROM category), 'APPROVED') ,
('raw materials', (SELECT id FROM category), 'APPROVED') ,
('production', (SELECT id FROM category), 'APPROVED');

WITH category AS (INSERT INTO tag_category(category) VALUES('governance') RETURNING id)
INSERT INTO tag(tag, tag_category, review_status)
VALUES
('cooperation', (SELECT id FROM category), 'APPROVED') ,
('monitoring & evaluation', (SELECT id FROM category), 'APPROVED');

WITH category AS (INSERT INTO tag_category(category) VALUES('technology & innovation') RETURNING id)
INSERT INTO tag(tag, tag_category, review_status)
VALUES
('development stage', (SELECT id FROM category), 'APPROVED') ,
('establishment - company type', (SELECT id FROM category), 'APPROVED') ,
('sectors', (SELECT id FROM category), 'APPROVED') ,
('technology type', (SELECT id FROM category), 'APPROVED') ;

WITH category AS (INSERT INTO tag_category(category) VALUES('financing') RETURNING id)
INSERT INTO tag(tag, tag_category, review_status)
VALUES
('investment & infrastructure', (SELECT id FROM category), 'APPROVED') ,
('r&d', (SELECT id FROM category), 'APPROVED') ,
('risk models', (SELECT id FROM category), 'APPROVED') ;
--;;
COMMIT;
