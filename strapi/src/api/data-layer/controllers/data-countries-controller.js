"use strict";


// src/api/datalayer/controllers/datalayer.js

module.exports = {
  async bulkUpsert(ctx) {
    const { argislayerid } = ctx.params;
    const { body } = ctx.request;
    if (!argislayerid) {
      return ctx.badRequest('Missing argislayerid param.');
    }

    if (!Array.isArray(body)) {
      return ctx.badRequest('Expected an array of items.');
    }

    const results = [];

    for (const item of body) {

      const { CountryName, Value, Year, CountryCode } = item;
      if (!CountryName) {
        continue; // Skip invalid entries
      }

      const existing = await strapi.db.query('api::data-layer.data-layer').findOne({
        where: {
          argislayerid,
          CountryName,
          Year
        },
      });
      if (existing) {
        const updated = await strapi.entityService.update('api::data-layer.data-layer', existing.id, {
          data: {
            Value,
          },
        });
        results.push(updated);
      } else {
        const created = await strapi.entityService.create('api::data-layer.data-layer', {
          data: {
            argislayerid,
            CountryName,
            Year,
            CountryCode,
            Value
          },
        });
        results.push(created);
      }
    }

    return results;
  },
};
