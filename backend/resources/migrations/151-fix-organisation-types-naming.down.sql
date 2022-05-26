BEGIN;
--;;
UPDATE organisation SET type = 'Academia & Research'
WHERE type = 'Academia and Research';
--;;
UPDATE organisation SET type = 'Intergovernmental Organizations'
WHERE type = 'Intergovernmental organization  (IGOs)';
--;;
UPDATE organisation SET type = 'Private Sector'
WHERE type = 'Private Sector (for-profit)';
--;;
COMMIT;
