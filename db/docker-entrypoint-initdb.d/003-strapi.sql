-- Strapi
-- Simulate a imported foreign schema

\connect gpml

CREATE TABLE public.files (
	id serial4 NOT NULL,
	"name" varchar(255) NULL,
	alternative_text varchar(255) NULL,
	caption varchar(255) NULL,
	width int4 NULL,
	height int4 NULL,
	formats jsonb NULL,
	hash varchar(255) NULL,
	ext varchar(255) NULL,
	mime varchar(255) NULL,
	"size" numeric(10, 2) NULL,
	url varchar(255) NULL,
	preview_url varchar(255) NULL,
	provider varchar(255) NULL,
	provider_metadata jsonb NULL,
	folder_path varchar(255) NULL,
	created_at timestamp(6) NULL,
	updated_at timestamp(6) NULL,
	created_by_id int4 NULL,
	updated_by_id int4 NULL,
	CONSTRAINT files_pkey PRIMARY KEY (id)
);

CREATE TABLE public.files_related_morphs (
	id serial4 NOT NULL,
	file_id int4 NULL,
	related_id int4 NULL,
	related_type varchar(255) NULL,
	field varchar(255) NULL,
	"order" float8 NULL,
	CONSTRAINT files_related_morphs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.layers (
	id serial4 NOT NULL,
	"name" varchar(255) NULL,
	title varchar(255) NULL,
	data_source text NULL,
	url varchar(255) NULL,
	arcgislayer_id varchar(255) NULL,
	subcategory_id varchar(255) NULL,
	short_description text NULL,
	category_id varchar(255) NULL,
	metadata text NULL,
	feature_id varchar(255) NULL,
	arcgis_map_id text NULL,
	layer_mapping_id varchar(255) NULL,
	units varchar(255) NULL,
	metadata_url text NULL,
	out_fields text NULL,
	time_period varchar(255) NULL,
	"comments" text NULL,
	created_at timestamp(6) NULL,
	updated_at timestamp(6) NULL,
	published_at timestamp(6) NULL,
	created_by_id int4 NULL,
	updated_by_id int4 NULL,
	layer_portal_item_id varchar(255) NULL,
	CONSTRAINT layers_pkey PRIMARY KEY (id)
);

ALTER TABLE public.files OWNER TO unep;
ALTER TABLE public.files_related_morphs OWNER TO unep;
ALTER TABLE public.layers OWNER TO unep;

-- Repeat for testing db

\connect gpml_test

CREATE TABLE public.files (
	id serial4 NOT NULL,
	"name" varchar(255) NULL,
	alternative_text varchar(255) NULL,
	caption varchar(255) NULL,
	width int4 NULL,
	height int4 NULL,
	formats jsonb NULL,
	hash varchar(255) NULL,
	ext varchar(255) NULL,
	mime varchar(255) NULL,
	"size" numeric(10, 2) NULL,
	url varchar(255) NULL,
	preview_url varchar(255) NULL,
	provider varchar(255) NULL,
	provider_metadata jsonb NULL,
	folder_path varchar(255) NULL,
	created_at timestamp(6) NULL,
	updated_at timestamp(6) NULL,
	created_by_id int4 NULL,
	updated_by_id int4 NULL,
	CONSTRAINT files_pkey PRIMARY KEY (id)
);

CREATE TABLE public.files_related_morphs (
	id serial4 NOT NULL,
	file_id int4 NULL,
	related_id int4 NULL,
	related_type varchar(255) NULL,
	field varchar(255) NULL,
	"order" float8 NULL,
	CONSTRAINT files_related_morphs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.layers (
	id serial4 NOT NULL,
	"name" varchar(255) NULL,
	title varchar(255) NULL,
	data_source text NULL,
	url varchar(255) NULL,
	arcgislayer_id varchar(255) NULL,
	subcategory_id varchar(255) NULL,
	short_description text NULL,
	category_id varchar(255) NULL,
	metadata text NULL,
	feature_id varchar(255) NULL,
	arcgis_map_id text NULL,
	layer_mapping_id varchar(255) NULL,
	units varchar(255) NULL,
	metadata_url text NULL,
	out_fields text NULL,
	time_period varchar(255) NULL,
	"comments" text NULL,
	created_at timestamp(6) NULL,
	updated_at timestamp(6) NULL,
	published_at timestamp(6) NULL,
	created_by_id int4 NULL,
	updated_by_id int4 NULL,
	layer_portal_item_id varchar(255) NULL,
	CONSTRAINT layers_pkey PRIMARY KEY (id)
);

ALTER TABLE public.files OWNER TO unep;
ALTER TABLE public.files_related_morphs OWNER TO unep;
ALTER TABLE public.layers OWNER TO unep;
