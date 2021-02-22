ALTER TABLE organisation
    ADD COLUMN program text,
    ADD COLUMN contribution text,
    ADD COLUMN expertise text,
    ADD COLUMN review_status review_status DEFAULT 'SUBMITTED' NOT NULL;
