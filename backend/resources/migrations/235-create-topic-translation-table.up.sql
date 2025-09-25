-- Create unified topic translation table
CREATE TABLE public.topic_translation (
    id SERIAL PRIMARY KEY,
    topic_type text NOT NULL,
    topic_id integer NOT NULL,
    language character varying(3) NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Performance indexes
CREATE INDEX idx_topic_translation_lookup ON topic_translation (topic_type, topic_id, language);
CREATE INDEX idx_topic_translation_type ON topic_translation (topic_type);
CREATE INDEX idx_topic_translation_language ON topic_translation (language);
CREATE INDEX idx_topic_translation_content ON topic_translation USING gin (content);

-- Constraints
ALTER TABLE topic_translation ADD CONSTRAINT fk_language
    FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE topic_translation ADD CONSTRAINT unique_topic_translation
    UNIQUE (topic_type, topic_id, language);

-- Set table owner
ALTER TABLE public.topic_translation OWNER TO unep;