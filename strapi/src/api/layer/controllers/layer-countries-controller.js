'use strict';

const { populateCountriesForLayers } = require('../services/populateCountries');

const { assignCountriesToLayers } = require('../services/assignCountriesToLayers');
module.exports = {
    async populateCountries(ctx) {
        const { arcgislayerId } = ctx.params;
        const { outFields } = ctx.request.body;

        if (!outFields || !Array.isArray(outFields) || outFields?.length < 3) {
            ctx.throw(400, 'Invalid outFields: Please provide an array with Year, Value, and Country fields.');
        }

        await populateCountriesForLayers(arcgislayerId, outFields);

        ctx.send('Countries populated for layers');
    },
    async appendValuePerCountry(ctx) {
        const { layerId } = ctx.params;
        const entries = ctx.request.body;


        try {
            const layer = await strapi.entityService.findOne('api::layer.layer', layerId, {
                populate: { ValuePerCountry: true },
            });

            const updatedValuePerCountry = [
                ...layer.ValuePerCountry,
                ...entries
            ];

            await strapi.entityService.update('api::layer.layer', layerId, {
                data: {
                    ValuePerCountry: updatedValuePerCountry,
                },
            });

            ctx.send({ message: 'Entries appended successfully' });
        } catch (error) {
            ctx.throw(500, 'Failed to append entries');
        }
    },
    async assignCountries(ctx) {
        await assignCountriesToLayers();

        ctx.send('Countries assigned to layers');
    }
}