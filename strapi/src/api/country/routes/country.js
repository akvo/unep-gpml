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
    {
      method: "GET",
      path: "/countries/assign-regions",
      handler: "country.assignRegions",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/countries/getAllCountries",
      handler: "country.getAllCountries",
      config: {
        auth: false,
      },
    }
  ],
};