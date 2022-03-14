ALTER TABLE policy
ADD COLUMN language INTEGER REFERENCES language(id);
--;;
ALTER TABLE stakeholder
ADD COLUMN job_title TEXT;
