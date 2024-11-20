//Calling this endpoint will add all countries to each layer

module.exports = {
    async assignCountriesToLayers() {
        try {

            const layers = await strapi.db.query('api::layer.layer').findMany({
                populate: ['ValuePerCountry'],
            });

            const countries = await strapi.db.query('api::country.country').findMany();

            for (const layer of layers) {
                const valuePerCountryList = countries.map((country) => ({
                    Value: 0,
                    Year: null,
                    CountryName: country["CountryName"],
                    country: country["id"]
                }));

                await strapi.entityService.update('api::layer.layer', layer.id, {
                    data: {
                        ValuePerCountry: valuePerCountryList,
                    },
                });
            }

            return true;
        } catch (err) {
            console.error('Error:', err);
            throw new Error('Error populating countries for layers');
        }
    },
};