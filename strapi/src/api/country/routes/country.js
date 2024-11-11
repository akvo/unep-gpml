'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::country.country');

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/countries/add-countries',
      handler: 'country.addCountries',
      config: {
        auth: false,
      },
    },
  ],
};