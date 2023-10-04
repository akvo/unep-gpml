CREATE USER unep WITH CREATEDB PASSWORD 'password';

CREATE DATABASE gpml
WITH OWNER = unep
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';

CREATE DATABASE gpml_test
WITH OWNER = unep
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';

CREATE DATABASE strapi_gpml
WITH OWNER = unep
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';