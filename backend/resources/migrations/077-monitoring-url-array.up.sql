UPDATE initiative SET
q4_4_5 = jsonb_build_array(q4_4_5)
WHERE jsonb_typeof(q4_4_5) = 'string';
