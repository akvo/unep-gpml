'use strict';

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/countries/populate-countries/:arcgislayerId',
            handler: 'layer-countries-controller.populateCountries',
            config: {
                auth: false,
            },
        },
        {
            method: 'GET',
            path: '/countries/assign-countries/',
            handler: 'layer-countries-controller.assignCountries',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/countries/:layerId/append-value-per-country',
            handler: 'layer-countries-controller.appendValuePerCountry',
            config: {
                auth: false,
            },
        },
    ],
};