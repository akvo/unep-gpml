ALTER TABLE event ADD COLUMN approved_at timestamptz;
-- ;;
ALTER TABLE event ADD COLUMN approved_by integer REFERENCES stakeholder(id);
-- ;;
