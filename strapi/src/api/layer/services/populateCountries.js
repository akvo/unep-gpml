const axios = require('axios');

module.exports = {
    async populateCountriesForLayers(arcgislayerId) {
        try {
            const layer = await strapi.entityService.findMany('api::layer.layer', {
                filters: {
                    arcgislayerId,
                }
            });

            if (!layer.length) {
                console.log(`Layer with arcgislayerid not found.`);
                return;
            }

            const layerId = layer[0].id;

            const arcgisUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${arcgislayerId}/FeatureServer/0/query?where=1=1&outFields=Year,Value,Country&f=json`;

            const response = await axios.get(arcgisUrl);

            const arcgisData = response.data.features.map(feature => feature.attributes);

            const groupedData = arcgisData.reduce((acc, current) => {
                const country = current.Country;

                if (!acc[country]) {
                    acc[country] = [];
                }
                acc[country].push(current);
                return acc;
            }, {});

            //Agreement is to import only the last year for each country and its value.
            const latestCountryData = Object.keys(groupedData).map(country => {
                const countryRows = groupedData[country];

                const latestRow = countryRows.reduce((prev, current) => {
                    return parseInt(current.Year) > parseInt(prev.Year) ? current : prev;
                });

                return latestRow;
            });

            const countries = await strapi.entityService.findMany('api::country.country', {
                fields: ['id', 'CountryName'],
            });

            if (!countries.length) {
                console.log('No countries found.');
                return;
            }

            const valuePerCountryData = countries.map(country => {
                const allCountryRows = [];

                countries.forEach(country => {
                    const countryRows = latestCountryData.filter(row => row.Country === country["CountryName"]);

                    if (countryRows.length > 0) {
                        allCountryRows.push(...countryRows);
                    }
                });

                const currentCountry = allCountryRows.find(row => row.Country === country["CountryName"])

                return {
                    Value: currentCountry ? currentCountry["Value"] : 0,
                    Year: currentCountry ? currentCountry["Year"].toString() : null,
                    CountryName: country["CountryName"],
                    country: country["id"]
                };
            });

            await strapi.entityService.update('api::layer.layer', layerId, {
                data: {
                    ValuePerCountry: valuePerCountryData,
                },
            });

            console.log(`Updated layer ${layerId} with values from ArcGIS.`);
        } catch (err) {
            console.error('Error populating countries for layer:', err);
        }
    },
};