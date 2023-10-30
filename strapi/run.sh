#!/usr/bin/sh

find . -type f -exec sed -i "s#https://unep-gpml.akvotest.org#$DOMAIN#g" {} +
yarn start