'use strict';

const { populateCountriesForLayers } = require('../services/populateCountries');

/**
 * layer controller
 */

const { assignCountriesToLayers } = require('../services/assignCountriesToLayers');
module.exports = {
    async populateCountries(ctx) {
        const { arcgislayerId } = ctx.params;

        await populateCountriesForLayers(arcgislayerId);

        ctx.send('Countries populated for layers');
    },
    async assignCountries(ctx) {
        await assignCountriesToLayers();

        ctx.send('Countries assigned to layers');
    }
}