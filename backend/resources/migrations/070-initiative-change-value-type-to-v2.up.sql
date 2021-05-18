UPDATE initiative
SET
    q16 = to_json(array[q16])::jsonb,
    q18 = to_json(array[q18])::jsonb,
    q20 = to_json(array[q20])::jsonb
WHERE version = 1
