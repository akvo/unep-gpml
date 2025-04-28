'use strict';

/**
 * data-layer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-layer.data-layer');
