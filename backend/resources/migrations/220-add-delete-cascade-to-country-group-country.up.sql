ALTER TABLE public.country_group_country
DROP CONSTRAINT country_group_country_country_fkey;

ALTER TABLE public.country_group_country
DROP CONSTRAINT country_group_country_country_group_fkey;

ALTER TABLE public.country_group_country
ADD CONSTRAINT country_group_country_country_fkey
FOREIGN KEY (country) REFERENCES public.country (id) ON DELETE CASCADE;

ALTER TABLE public.country_group_country
ADD CONSTRAINT country_group_country_country_group_fkey
FOREIGN KEY (country_group) REFERENCES public.country_group (id) ON DELETE CASCADE;

