const axios = require("axios");

function parseNumber(value) {
  if (typeof value === "string") {
    value = value.replace(/,/g, "");
  }
  return parseFloat(value);
}

module.exports = {
  async populateCountriesForLayers(arcgislayerId, outFields) {
    try {
      const layers = await strapi.entityService.findMany("api::layer.layer", {
        filters: { arcgislayerId },
        locale: "all",
      });

      if (!layers.length) {
        console.log(`Layer with arcgislayerId not found.`);
        return;
      }

      const arcgisUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${arcgislayerId}/FeatureServer/0/query`;

      let arcgisData = [];
      let hasMore = true;
      let offset = 0;
      const limit = 100;

      while (hasMore) {
        const urlWithPagination = `${arcgisUrl}?where=1=1&outFields=${outFields.join(
          ","
        )}&f=json&resultRecordCount=${limit}&resultOffset=${offset}`;
        console.log("Fetching from:", urlWithPagination);

        const response = await axios.get(urlWithPagination);
        const features = response.data.features?.map(
          (feature) => feature.attributes
        );

        if (!features || features.length === 0) {
          hasMore = false;
          break;
        }

        arcgisData = arcgisData.concat(features);
        offset += limit;
        hasMore = features.length === limit;
      }

      console.log("Total ArcGIS records retrieved:", arcgisData.length);

      const groupedData = arcgisData.reduce((acc, current) => {
        const country = current[outFields[2]];
        if (!acc[country]) acc[country] = [];
        acc[country].push(current);
        return acc;
      }, {});

      const countries = await strapi.entityService.findMany(
        "api::country.country",
        {
          fields: ["id", "CountryName", "CountryCode"],
        }
      );

      if (!countries.length) {
        console.log("No countries found.");
        return;
      }

      const valuePerCountryData = countries
        .flatMap((country) => {
          const key = country["CountryName"]; //country['CountryCode'] ||
          const countryRows = groupedData[key] || [];

          return countryRows?.map((row) => ({
            Value: parseNumber(Math.round(row[outFields[1]]).toFixed(2)),
            City: outFields[3] && row[outFields[3]] ? row[outFields[3]] : "",
            Year: row[outFields[0]]?.toString(),
            CountryName: country["CountryName"],
            CountryCode: country["CountryCode"],
          }));
        })
        .filter(Boolean); // Filter out any undefined values

      const batchSize = 20;
      const baseUrl = process.env.STRAPI_URL || "http://localhost:1337";
      console.log(
        "Values per country data length:",
        valuePerCountryData.length
      );

      // Process each layer with its localization
      for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        const currentLayer = layers[layerIndex];
        console.log(
          `Processing layer ${layerIndex + 1}/${layers.length}, ID: ${
            currentLayer.id
          }`
        );

        // Process data in batches
        for (let i = 0; i < valuePerCountryData.length; i += batchSize) {
          const batch = valuePerCountryData.slice(i, i + batchSize);

          if (batch.length > 0) {
            try {
              await axios.post(
                `${baseUrl}/api/countries/${currentLayer.id}/append-value-per-country`,
                batch
              );
              console.log(
                `Uploaded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
                  valuePerCountryData.length / batchSize
                )} (${batch.length} records) for layer ${currentLayer.id}`
              );
            } catch (batchError) {
              console.error(
                `Error uploading batch for layer ${currentLayer.id}:`,
                batchError.message
              );
            }
          }
        }
      }

      console.log(
        `Successfully updated all language variants of layer ${arcgislayerId} with values from ArcGIS.`
      );
    } catch (err) {
      console.error("Error populating countries for layer:", err);
      throw err; // Re-throw to allow caller to handle if needed
    }
  },
  async populateDataLayers(arcgislayerId, outFields) {
    try {

      const arcgisUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${arcgislayerId}/FeatureServer/0/query`;

      let arcgisData = [];
      let hasMore = true;
      let offset = 0;
      const limit = 100;

      while (hasMore) {
        const urlWithPagination = `${arcgisUrl}?where=1=1&outFields=${outFields.join(
          ","
        )}&f=json&resultRecordCount=${limit}&resultOffset=${offset}`;
        console.log("Fetching from:", urlWithPagination);

        const response = await axios.get(urlWithPagination);
        const features = response.data.features?.map(
          (feature) => feature.attributes
        );

        if (!features || features.length === 0) {
          hasMore = false;
          break;
        }

        arcgisData = arcgisData.concat(features);
        offset += limit;
        hasMore = features.length === limit;
      }

      console.log("Total ArcGIS records retrieved:", arcgisData.length);

      const groupedData = arcgisData.reduce((acc, current) => {
        const country = current[outFields[2]];
        if (!acc[country]) acc[country] = [];
        acc[country].push(current);
        return acc;
      }, {});

      const countries = await strapi.entityService.findMany(
        "api::country.country",
        {
          fields: ["id", "CountryName", "CountryCode"],
        }
      );

      if (!countries.length) {
        console.log("No countries found.");
        return;
      }

      const valuePerCountryData = countries
        .flatMap((country) => {
          const key = country["CountryName"]; //country['CountryCode'] ||
          const countryRows = groupedData[key] || [];

          return countryRows?.map((row) => ({
            Value: parseNumber(parseFloat(row[outFields[1]]).toFixed(2)),
            City: outFields[3] && row[outFields[3]] ? row[outFields[3]] : "",
            Year: row[outFields[0]]?.toString(),
            CountryName: country["CountryName"],
            CountryCode: country["CountryCode"],
          }));
        })
        .filter(Boolean); // Filter out any undefined values

      const batchSize = 20;
      const baseUrl = process.env.STRAPI_URL || "http://localhost:1337";
      console.log(
        "Values per country data length:",
        valuePerCountryData.length
      );

      for (let i = 0; i < valuePerCountryData.length; i += batchSize) {
        const batch = valuePerCountryData.slice(i, i + batchSize);

        if (batch.length > 0) {
          try {
            await axios.post(
              `${baseUrl}/api/layercollections/${arcgislayerId}/bulk-upsert`,
              batch
            );
            console.log(
              `Uploaded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
                valuePerCountryData.length / batchSize
              )} (${batch.length} records) for layer ${arcgislayerId}`
            );
          } catch (batchError) {
            console.error(
              `Error uploading batch for layer ${arcgislayerId}:`,
              batchError.message
            );
          }
        }
      }

      console.log(
        `Successfully updated all language variants of layer ${arcgislayerId} with values from ArcGIS.`
      );
    } catch (err) {
      console.error("Error populating countries for layer:", err);
      throw err; // Re-throw to allow caller to handle if needed
    }
  },
  async populateDataLayerChunk(arcgislayerId, outFields, offset, limit = 100) {
    const arcgisUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${arcgislayerId}/FeatureServer/0/query`;
    const baseUrl = process.env.STRAPI_URL || "http://localhost:1337";
  
    const urlWithPagination = `${arcgisUrl}?where=1=1&outFields=${outFields.join(
      ","
    )}&f=json&resultRecordCount=${limit}&resultOffset=${offset}`;
  
    console.log("Fetching from:", urlWithPagination);
    const response = await axios.get(urlWithPagination);
    const features = response.data.features?.map((f) => f.attributes);
  
    if (!features || features.length === 0) {
      console.log("No more data at offset:", offset);
      return { done: true };
    }
  
    const groupedData = features.reduce((acc, current) => {
      const country = current[outFields[2]];
      if (!acc[country]) acc[country] = [];
      acc[country].push(current);
      return acc;
    });
  
    const countries = await strapi.entityService.findMany("api::country.country", {
      fields: ["id", "CountryName", "CountryCode"],
    });
  
    const valuePerCountryData = countries
      .flatMap((country) => {
        const key = country["CountryName"];
        const countryRows = groupedData[key] || [];
  
        return countryRows.map((row) => ({
          Value: parseNumber(parseFloat(row[outFields[1]]).toFixed(2)),
          City: outFields[3] && row[outFields[3]] ? row[outFields[3]] : "",
          Year: row[outFields[0]]?.toString(),
          CountryName: country["CountryName"],
          CountryCode: country["CountryCode"],
        }));
      })
      .filter(Boolean);
  
    const batchSize = 20;
    for (let i = 0; i < valuePerCountryData.length; i += batchSize) {
      const batch = valuePerCountryData.slice(i, i + batchSize);
      await axios.post(
        `${baseUrl}/api/layercollections/${arcgislayerId}/bulk-upsert`,
        batch
      );
    }
  
    console.log(`Processed offset ${offset}, fetched ${features.length} features`);
    return { done: features.length < limit }; // If less than limit, it's the last page
  }
  
};

async function appendValuePerCountryDirect(layerId, entries) {
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

    return { success: true };
  } catch (error) {
    console.error("Failed to append entries:", error);
    throw error;
  }
}
