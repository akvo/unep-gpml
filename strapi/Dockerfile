FROM node:18-alpine3.18
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json yarn.lock ./
RUN yarn global add node-gyp
RUN yarn config set network-timeout 600000 -g && yarn install
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
RUN yarn add pg
RUN yarn add strapi-plugin-import-export-entries
RUN yarn add @strapi-community/strapi-provider-upload-google-cloud-storage
RUN yarn add @sklinet/strapi-plugin-tinymce
RUN ["yarn", "build"]
EXPOSE 1337
CMD ["yarn", "develop"]