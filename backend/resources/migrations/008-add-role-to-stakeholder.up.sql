CREATE TYPE stakeholder_role AS ENUM ('USER', 'ADMIN');
ALTER TABLE stakeholder ADD COLUMN role stakeholder_role DEFAULT 'USER';
