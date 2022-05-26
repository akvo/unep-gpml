BEGIN;
--;;
UPDATE organisation SET type = 'Academia and Research'
WHERE type = 'Academia & Research';
--;;
UPDATE organisation SET type = 'Intergovernmental Organizations (IGOs)'
WHERE type = 'Intergovernmental organization';
--;;
UPDATE organisation SET type = 'Private Sector (for-profit)'
WHERE type = 'Private Sector';
--;;
COMMIT;
