BEGIN;
--;;
ALTER TABLE plastic_strategy_initiative_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_initiative_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_initiative_bookmark_pkey PRIMARY KEY (plastic_strategy_id, initiative_id, section_key);
--;;
ALTER TABLE plastic_strategy_case_study_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_case_study_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_case_study_bookmark_pkey PRIMARY KEY (plastic_strategy_id, case_study_id, section_key);
--;;
ALTER TABLE plastic_strategy_technology_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_technology_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_technology_bookmark_pkey PRIMARY KEY (plastic_strategy_id, technology_id, section_key);
--;;
ALTER TABLE plastic_strategy_policy_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_policy_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_policy_bookmark_pkey PRIMARY KEY (plastic_strategy_id, policy_id, section_key);
--;;
ALTER TABLE plastic_strategy_event_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_event_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_event_bookmark_pkey PRIMARY KEY (plastic_strategy_id, event_id, section_key);
--;;
ALTER TABLE plastic_strategy_resource_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_resource_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_resource_bookmark_pkey PRIMARY KEY (plastic_strategy_id, resource_id, section_key);
--;;
ALTER TABLE plastic_strategy_organisation_bookmark
    ADD COLUMN section_key TEXT NOT NULL,
    DROP CONSTRAINT plastic_strategy_organisation_bookmark_pkey,
    ADD CONSTRAINT plastic_strategy_organisation_bookmark_pkey PRIMARY KEY (plastic_strategy_id, organisation_id, section_key);
--;;
COMMIT;
