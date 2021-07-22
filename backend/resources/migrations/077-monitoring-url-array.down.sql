UPDATE initiative SET
q4_4_5 = to_jsonb(q4_4_5 ->> 0)
WHERE jsonb_typeof(q4_4_5) = 'array';
