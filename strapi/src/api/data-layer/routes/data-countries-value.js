'use strict';

module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/datalayers/:argislayerid/bulk-upsert',
        handler: 'data-countries-controller.bulkUpsert',
        config: {
          auth: false, // or true, depending if you want protected
        },
      },
    ],
  };
  