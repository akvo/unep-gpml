'use strict';

module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/layercollections/:argislayerid/bulk-upsert',
        handler: 'layer-collection-controller.bulkUpsert',
        config: {
          auth: false, // or true, depending if you want protected
        },
      },
    ],
  };
  