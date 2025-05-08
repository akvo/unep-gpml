"use strict";


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

      const { CountryName, Value, OBS_Value_, OBS_Valu_1, Median, Mean, Esc_to_oce,Total_Tons,Esc_to_o_c, Esc_to_coa, Year, Time, Time_Perio, CountryCode, City } = item;
      if (!CountryName) {
        continue; // Skip invalid entries
      }

      const existing = await strapi.db.query('api::layer-collection.layer-collection').findOne({
        where: {
          argislayerid,
          CountryName,
          Year : Year ?? Time ?? Time_Perio
        },
      });
      
      const dataUpdated = Value ?? OBS_Value_ ?? OBS_Valu_1 ?? Median ?? Mean ?? Esc_to_oce ?? Esc_to_o_c ?? Total_Tons ?? Esc_to_coa;
      console.log('dataUpdated', dataUpdated, CountryName);
      if (existing) {
        const updated = await strapi.entityService.update('api::layer-collection.layer-collection', existing.id, {
          data: {
           Value: dataUpdated,
          },
        });
        results.push(updated);
      } else {
        const created = await strapi.entityService.create('api::layer-collection.layer-collection', {
          data: {
            argislayerid,
            CountryName,
            Year,
            CountryCode,
            Value :dataUpdated,
            City
          },
        });
        results.push(created);
      }
    }

    return results;
  },
  async findArgisDataCollections(ctx) {
    const { argislayerid } = ctx.params;

    if (!argislayerid) {
      return ctx.badRequest('Missing argislayerid');
    }

    const data = await strapi.entityService.findMany('api::layer-collection.layer-collection', {
      filters: {
        argislayerid: argislayerid,
      },
      pagination: {
        page: 1,
        pageSize: 2000,
      },
      publicationState: 'preview',
    });

    return data;
  },
};
