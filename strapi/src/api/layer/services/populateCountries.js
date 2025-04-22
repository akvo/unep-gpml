const axios = require('axios');

function parseNumber(value) {
    if (typeof value === 'string') {
        value = value.replace(/,/g, '');
    }
    return parseFloat(value);
}

module.exports = {
    async populateCountriesForLayers(arcgislayerId, outFields) {
        try {
            const layer = await strapi.entityService.findMany('api::layer.layer', {
                filters: { arcgislayerId },
            });

            if (!layer.length) {
                console.log(`Layer with arcgislayerId not found.`);
                return;
            }

            const layerId = layer[0].id;
            const arcgisUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${arcgislayerId}/FeatureServer/0/query`;

            let arcgisData = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const urlWithPagination = `${arcgisUrl}?where=1=1&outFields=${outFields.join(',')}&f=json&resultRecordCount=${limit}&resultOffset=${offset}`;
                console.log('Fetching from:', urlWithPagination);

                const response = await axios.get(urlWithPagination);
                const features = response.data.features?.map((feature) => feature.attributes);

                arcgisData = arcgisData.concat(features);
                offset += limit;
                hasMore = features.length === limit;
            }

            console.log('Total ArcGIS records retrieved:', arcgisData.length);

            const groupedData = arcgisData.reduce((acc, current) => {
                const country = current[outFields[2]];
                if (!acc[country]) acc[country] = [];
                acc[country].push(current);
                return acc;
            }, {});

            const countries = await strapi.entityService.findMany('api::country.country', {
                fields: ['id', 'CountryName', 'CountryCode'],
            });

            if (!countries.length) {
                console.log('No countries found.');
                return;
            }     
            const valuePerCountryData = countries.flatMap((country) => {
                const key = country['CountryName']; //country['CountryCode'] ||
                const countryRows = groupedData[key] || [];
           
                return countryRows?.map((row) => ({
                    Value: parseNumber(Math.round(row[outFields[1]]).toFixed(2)), 
                    City: outFields[3] && row[outFields[3]] ? row[outFields[3]] : "",
                    Year: row[outFields[0]]?.toString(),
                    CountryName: country['CountryName'],
                    CountryCode: country['CountryCode']
                }));
            });

            const batchSize = 20;
            const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
            for (let i = 0; i < valuePerCountryData.length; i += batchSize) {
                const batch = valuePerCountryData.slice(i, i + batchSize);

              await axios.post(`${baseUrl}/api/countries/${layerId}/append-value-per-country`, batch);
                // await appendValuePerCountryDirect(layerId, batch);
                console.log(`Uploaded batch of ${batch.length} records.`);
            }

            console.log(`Successfully updated layer ${layerId} with all values from ArcGIS.`);
        } catch (err) {
            console.error('Error populating countries for layer:', err);
        }
    },
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
