UPDATE initiative
SET
    q16 = (q16->>0)::jsonb,
    q18 = (q18->>0)::jsonb,
    q20 = (q20->>0)::jsonb
WHERE version = 1
