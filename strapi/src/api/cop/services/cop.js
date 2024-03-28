'use strict';

/**
 * cop service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cop.cop');
