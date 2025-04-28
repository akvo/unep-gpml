'use strict';

/**
 * data-layer router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::data-layer.data-layer');
