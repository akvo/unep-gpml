'use strict';

module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/layercollections/:argislayerid/bulk-upsert',
        handler: 'layer-collection-controller.bulkUpsert',
        config: {
          auth: false, 
        },
      },
      {
        method: 'GET',
        path: '/layercollections/:argislayerid',
        handler: 'layer-collection-controller.findArgisDataCollections',
        config: {
          auth: false, 
        },
      },
    ],
  };
  