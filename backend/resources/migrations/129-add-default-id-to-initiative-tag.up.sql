CREATE SEQUENCE initiative_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--;;
ALTER TABLE ONLY initiative_tag
ALTER COLUMN id SET DEFAULT nextval('initiative_tag_id_seq');
--;;
ALTER TABLE initiative_tag
ADD CONSTRAINT initiative_tag_pk primary key(id);
