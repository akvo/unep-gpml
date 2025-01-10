CREATE TABLE plastic_strategy_project_bookmark (
    plastic_strategy_id INTEGER NOT NULL REFERENCES plastic_strategy (id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    section_key TEXT NOT NULL,
    CONSTRAINT plastic_strategy_project_bookmark_pkey PRIMARY KEY (plastic_strategy_id, project_id)
);
