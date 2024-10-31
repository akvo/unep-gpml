'use strict';

module.exports = {
    routes: [
        {
            method: 'GET',
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
        // {
        //   method: 'GET',
        //   path: '/category/template/:categoryId',
        //   handler: 'layer-countries-controller.generateTemplate',
        //   config: {
        //     auth: false,
        //   },
        // },
    ],
};