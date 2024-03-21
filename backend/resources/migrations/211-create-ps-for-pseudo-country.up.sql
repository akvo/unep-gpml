INSERT INTO plastic_strategy (country_id)
VALUES ((SELECT id FROM country WHERE iso_code_a3 = '00A'));
