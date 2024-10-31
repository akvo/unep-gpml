const fetch = require('node-fetch');

module.exports = {
    async populateCountriesTable(ctx) {
        try {
            const response = await fetch('https://digital.gpmarinelitter.org/api/country');
            const countries = await response.json();

            for (const country of countries) {

                const { id, name } = country;

                const existingCountry = await strapi.db.query('api::country.country').findOne({
                    where: { CountryDBId: id },
                });

                if (existingCountry) {
                    console.log(`Country ${name} already exists.`);
                    return;
                }


                await strapi.db.query('api::country.country').create({
                    data: {
                        CountryDBId: id,
                        CountryName: name,
                    },
                });
            }

            return true;
        } catch (error) {
            console.error('Error fetching or creating countries:', error);
            return ctx.send({
                success: false,
                error: 'Error fetching or creating countries',
            });
        }
    },

    async populateCountriesForLayers(ctx) {
        try {
            const layers = await strapi.db.query('api::layer.layer').findMany({
                populate: ['ValuePerCountry'],
            });

            const countries = await strapi.db.query('api::country.country').findMany();

            for (const layer of layers) {
                const existingValuePerCountry = layer.ValuePerCountry || [];

                const valuePerCountryList = countries.map((country) => {
                    const existingEntry = existingValuePerCountry.find(
                        (entry) => entry.country === country.id
                    );

                    return existingEntry
                        ? existingEntry
                        : {
                            Value: 0,
                            Year: null,
                            country: country.id,
                            CountryName: country.CountryName,
                        };
                });


                await strapi.db.query('api::layer.layer').update({
                    where: { id: layer.id },
                    data: {
                        ValuePerCountry: valuePerCountryList,
                    },
                });
            }

            return ctx.send({
                success: true,
                message: 'Successfully added.',
            });
        } catch (err) {
            console.error('Error:', err.message || err);
            return ctx.send({
                success: false,
                error: 'Error adding countries.',
            });
        }
    },

};