ALTER TABLE event
    ADD COLUMN country integer REFERENCES country(id),
    ADD COLUMN city text;
