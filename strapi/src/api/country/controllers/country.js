'use strict';

const { addAllCountries } = require('../services/addAllCountries');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::country.country');

module.exports = {
  async addCountries(ctx) {
    await addAllCountries();
    ctx.send('Countries added');
  },
  async assignRegions() {
    const countries = await strapi.entityService.findMany('api::country.country', {
      populate: '*',
    });

    if (!countries || countries.length === 0) {
      console.error('No countries found in the database.');
      return;
    }

    const regionMappings = {
      "East Asia & Pacific": 1,
      "South Asia": 2,
      "Middle East & North Africa": 3,
      "Latin America & Caribbean": 4,
      "North America": 5,
      "Europe & Central Asia": 6,
      "Sub-Saharan Africa": 7,
    };

    const countryRegionMappings = {
      "East Asia & Pacific": [
        "ASM", "AUS", "BRN", "KHM", "CHN",
        "FJI", "PYF", "GUM", "HKG", "IDN",
        "JPN", "KIR", "PRK", "KOR", "LAO",
        "MAC", "MYS", "MHL", "FSM", "MNG",
        "MMR", "NRU", "NCL", "NZL",
        "MNP", "PLW", "PNG", "PHL",
        "WSM", "SGP", "SLB", "TWN", "THA",
        "TLS", "TON", "TUV", "VUT", "VNM"
      ],
      "South Asia": [
        "AFG", "BGD", "BTN", "IND",
        "MDV", "NPL", "PAK", "LKA"
      ],
      "Middle East & North Africa": [
        "DZA", "BHR", "DJI", "EGY", "IRN",
        "IRQ", "ISR", "JOR", "KWT", "LBN",
        "LBY", "MLT", "MAR", "OMN", "QAT",
        "SAU", "SYR", "TUN", "ARE", "PSE",
        "YEM"
      ],
      "Sub-Saharan Africa": [
        "AGO", "BEN", "BWA", "BFA", "BDI", "CPV",
        "CMR", "CAF", "TCD", "COM", "COD",
        "COG", "CIV", "GNQ", "ERI", "SWZ",
        "ETH", "GAB", "GMB", "GHA", "GIN",
        "GNB", "KEN", "LSO", "LBR", "MDG", "MWI",
        "MLI", "MRT", "MUS", "MOZ", "NAM", "NER",
        "NGA", "RWA", "STP", "SEN", "SYC",
        "SLE", "SOM", "ZAF", "SSD", "SDN",
        "TZA", "TGO", "UGA", "ZMB", "ZWE"
      ],
      "Latin America & Caribbean": [
        "ATG", "ARG", "ABW", "BHS", "BRB",
        "BLZ", "BOL", "BRA", "CYM", "CHL",
        "COL", "CRI", "CUB", "CUW", "DMA",
        "DOM", "ECU", "SLV", "GRD", "GTM",
        "GUY", "HTI", "HND", "JAM", "MEX",
        "NIC", "PAN", "PRY", "PER", "PRI",
        "KNA", "LCA", "MAF", "VCT",
        "SUR", "TTO", "URY", "VEN", "VIR"
      ],
      "North America": [
        "BMU", "CAN", "GRL", "USA"
      ],
      "Europe & Central Asia": [
        "ALB", "AND", "ARM", "AUT", "AZE", "BLR", "BEL",
        "BIH", "BGR", "CHI", "HRV",
        "CYP", "CZE", "DNK", "EST", "FRO",
        "FIN", "FRA", "GEO", "DEU", "GIB",
        "GRC", "HUN", "ISL", "IRL", "IMN",
        "ITA", "KAZ", "XKX", "KGZ", "LVA",
        "LIE", "LTU", "LUX", "MLT", "MDA",
        "MCO", "MNE", "NLD", "MKD", "NOR",
        "POL", "PRT", "ROU", "RUS", "SMR",
        "SRB", "SVK", "SVN", "ESP", "SWE",
        "CHE", "TJK", "TKM", "UKR", "GBR",
        "UZB"
      ]
    };

    for (const [regionName, countryCodes] of Object.entries(countryRegionMappings)) {
      const regionId = regionMappings[regionName];
      if (!regionId) {
        console.error(`Region ID not found for region: ${regionName}`);
        continue;
      }

      for (const countryCode of countryCodes) {
        const country = countries.find(c => c.CountryCode === countryCode);

        if (country) {
          console.log(`Updating country: ${country.Name || country.name} (${countryCode}) to region ID: ${regionId}`);
          await strapi.entityService.update('api::country.country', country.id, {
            data: { RegionID: regionId },
          });
        } else {
          console.warn(`Country not found for code: ${countryCode}`);
        }
      }
    }

    console.log('Region assignment completed.');
  },
  async getAllCountries(ctx) {
    try {
      const countries = await strapi.entityService.findMany('api::country.country', {
        populate: '*',
      });

      ctx.send(countries);
    } catch (error) {
      ctx.send({ error: 'Error fetching countries' });
    }
  },
};