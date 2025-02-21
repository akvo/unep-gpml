'use strict';

const { populateCountriesForLayers } = require('../services/populateCountries');

const { assignCountriesToLayers } = require('../services/assignCountriesToLayers');
module.exports = {
    async populateCountries(ctx) {
        const { arcgislayerId } = ctx.params;
        const { outFields } = ctx.request.body;

        console.log('outFields',outFields)

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
            const layer = await strapi.entityService.findOne('api::layer.layer', 3, {
                populate: { ValuePerCountry: true },
            });

            const updatedValuePerCountry = [
                ...layer.ValuePerCountry,
                ...entries
            ];

            await strapi.entityService.update('api::layer.layer', 3, {
                data: {
                    ValuePerCountry: updatedValuePerCountry,
                },
            });

            ctx.send({ message: 'Entries appended successfully' });
        } catch (error) {
            ctx.throw(500, 'Failed to append entries');
        }
    },
    async removeValuePerCountry(ctx) {
        const { arcgislayerId } = ctx.params;
        try {
            const layer = await strapi.entityService.findMany('api::layer.layer', {
                filters: { arcgislayerId },
            });

            if (!layer.length) {
                console.log(`Layer with arcgislayerId not found.`);
                return;
            }

            const layerId = layer[0].id;

            if (!layer) {
                throw new Error(`Layer with arcgislayerid ${layerId} not found`);
            }

            await strapi.entityService.update('api::layer.layer', layerId, {
                data: {
                    ValuePerCountry: [],
                },
            });

            ctx.send({ message: `ValuePerCountry entries removed successfully for layer ID ${layerId}.` });
        } catch (error) {
            ctx.throw(500, 'Failed to remove ValuePerCountry entries', { error });
        }
    },
    async assignCountries(ctx) {
        await assignCountriesToLayers();

        ctx.send('Countries assigned to layers');
    }
}