BEGIN;
ALTER TYPE project_association ADD VALUE IF NOT EXISTS 'resource_editor';
ALTER TYPE project_association ADD VALUE IF NOT EXISTS 'partner';
ALTER TYPE project_association ADD VALUE IF NOT EXISTS 'donor';
COMMIT;
