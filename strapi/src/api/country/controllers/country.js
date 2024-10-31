'use strict';

const { populateCountriesTable } = require('../services/populateCountriesTable');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::country.country');

// Add countries to countries table
module.exports = {
    async addCountries(ctx) {
        await populateCountriesTable();
        ctx.send('Countries added');
    },
};