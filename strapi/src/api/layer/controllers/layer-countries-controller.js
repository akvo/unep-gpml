"use strict";

const {
  populateCountriesForLayers,
  populateDataLayers,
} = require("../services/populateCountries");

const {
  assignCountriesToLayers,
} = require("../services/assignCountriesToLayers");
module.exports = {
  async postGisDataLayers(ctx) {
    const { arcgislayerId } = ctx.params;
    const { outFields } = ctx.request.body;

    if (!outFields || !Array.isArray(outFields) || outFields?.length < 3) {
      ctx.throw(
        400,
        "Invalid outFields: Please provide an array with Year, Value, and Country fields."
      );
    }
    await populateDataLayers(arcgislayerId, outFields);

    ctx.send("Countries populated for layers");
  },
  async populateCountries(ctx) {
    const { arcgislayerId } = ctx.params;
    const { outFields } = ctx.request.body;

    if (!outFields || !Array.isArray(outFields) || outFields?.length < 3) {
      ctx.throw(
        400,
        "Invalid outFields: Please provide an array with Year, Value, and Country fields."
      );
    }

    await populateCountriesForLayers(arcgislayerId, outFields);

    ctx.send("Countries populated for layers");
  },
  async appendValuePerCountry(ctx) {
    const { layerId } = ctx.params;
    const entries = ctx.request.body;

    try {
      const layer = await strapi.entityService.findOne(
        "api::layer.layer",
        layerId,
        {
          populate: { ValuePerCountry: true },
        }
      );

      const updatedValuePerCountry = [...layer.ValuePerCountry, ...entries];

      await strapi.entityService.update("api::layer.layer", layerId, {
        data: {
          ValuePerCountry: updatedValuePerCountry,
        },
      });

      // // Using Knex (Strapi's query builder)
      // const knex = strapi.db.connection;

      // // Get the current layer data (without loading the entire ValuePerCountry array)
      // const layer = await knex('layers')
      //   .where({ id: layerId })
      //   .first();

      // if (!layer) {
      //   return ctx.throw(404, "Layer not found");
      // }

      // // Get the current ValuePerCountry array without loading all relations
      // const result = await knex.raw(
      //   'SELECT "ValuePerCountry" FROM layers WHERE id = ?',
      //   [layerId]
      // );

      // // Extract current values and merge with new entries
      // let currentValues = result.rows[0].ValuePerCountry || [];

      // // If it's stored as a string (JSON), parse it
      // if (typeof currentValues === 'string') {
      //   currentValues = JSON.parse(currentValues);
      // }

      // const updatedValues = [...currentValues, ...entries];

      // // Update only the ValuePerCountry field using raw SQL
      // await knex.raw(
      //   'UPDATE layers SET "ValuePerCountry" = ? WHERE id = ?',
      //   [JSON.stringify(updatedValues), layerId]
      // );

      ctx.send({
        message: "Entries appended successfully",
        count: entries.length,
      });
    } catch (error) {
      console.error("Error appending values:", error);
      ctx.throw(500, "Failed to append entries");
    }
  },
  async removeValuePerCountry(ctx) {
    const { arcgislayerId } = ctx.params;
    try {
      const layer = await strapi.entityService.findMany("api::layer.layer", {
        filters: { arcgislayerId },
      });

      if (!layer.length) {
        console.log(`Layer with arcgislayerId not found.`);
        return;
      }

      const layerId = layer[0].id;

      if (!layer) {
        throw new Error(`Layer with arcgislayerid ${layerId} not found`);
      }

      await strapi.entityService.update("api::layer.layer", layerId, {
        data: {
          ValuePerCountry: [],
        },
      });

      ctx.send({
        message: `ValuePerCountry entries removed successfully for layer ID ${layerId}.`,
      });
    } catch (error) {
      ctx.throw(500, "Failed to remove ValuePerCountry entries", { error });
    }
  },
  async assignCountries(ctx) {
    await assignCountriesToLayers();

    ctx.send("Countries assigned to layers");
  },
  async populateCountriesLayer(ctx) {
    let request = ctx.request.body;

    let { outFields, arcgislayerId } = request.entry;

    if (
      request.uid === "api::layer.layer" ||
      (request.model === "layer" && arcgislayerId)
    ) {
      if (!outFields) {
        if (arcgislayerId.includes("weight")) {
          outFields = ["Year", "Value", "Country"];
        } else if (arcgislayerId.includes("value")) {
          outFields = ["Time", "Value", "Country"];
        }
      }

      if (!outFields || !Array.isArray(outFields) || outFields.length < 3) {
        ctx.throw(
          400,
          "Invalid outFields: Please provide an array with at least Year, Value, and Country fields."
        );
      }

      await populateCountriesForLayers(arcgislayerId, outFields);

      ctx.send("Countries populated for layers");
    }

    ctx.send("Not layers");
  },
};
