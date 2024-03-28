'use strict';

/**
 * cop controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cop.cop');
