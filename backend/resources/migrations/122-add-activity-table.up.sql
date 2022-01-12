CREATE TABLE activity (
       id UUID,
       type ACTIVITY_TYPE NOT NULL,
       created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
       owner_id INTEGER NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
       metadata JSONB
);
