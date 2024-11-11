BEGIN;
DELETE FROM rbac_context WHERE context_type_name='project';
COMMIT;
