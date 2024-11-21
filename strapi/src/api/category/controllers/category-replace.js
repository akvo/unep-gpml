const axios = require('axios');

module.exports = {
    async replacePlaceholders(ctx) {
        try {
            const decimalConfig = {
                default: 0,
                Municipal_solid_waste_generated_annually_V3_WFL1: 0,
                Proportion_of_municipal_waste_recycled_13_10_24_WFL1: 2,
                Municipal_solid_waste_generated_daily_per_capita_V3_WFL1: 2,
                total: 0,
                last: 2,
                first: 2,
            };

            const { country, categoryId } = ctx.params;

            const categoryAll = await strapi.entityService.findMany('api::category.category', categoryId);
            const category = categoryAll.find(cat => cat.categoryId === categoryId);

            if (!category) {
                return ctx.notFound('Category not found');
            }

            const { template, placeholders } = category.textTemplate;

            const uniqueLayerIds = [...new Set(
                placeholders
                    .map(placeholder => placeholder.split('=')[0].split(/(_year|_total|_last|_first|_city|\*|\/|\+|\-)/)[0].trim())
            )];

            const allLayersResponse = await axios.get(`https://unep-gpml.akvotest.org/strapi/api/layers?pagination[page]=1&pagination[pageSize]=150&populate=ValuePerCountry`);
            const allLayers = allLayersResponse.data?.data || [];

            const layerData = allLayers.filter(layer =>
                uniqueLayerIds.includes(layer.attributes.arcgislayerId)
            );

            if (!layerData || layerData.length === 0) {
                return ctx.notFound('Layers not found');
            }

            const layerDataByArcgisId = {};
            layerData.forEach(layer => {
                if (layer && layer.attributes) {
                    const { arcgislayerId, ValuePerCountry } = layer.attributes;
                    layerDataByArcgisId[arcgislayerId] = ValuePerCountry?.filter(c => c.CountryName === country) || [];
                }
            });

            const calculatedValues = {};
            const tooltips = {};

            const evaluateFormula = (formula) => {
                const evaluatedFormula = formula.replace(/\b(\w+_\w+(_\w+)*)\b/g, (match) => {
                    const arcgislayerId = match.replace(/(_year|_total|_last|_first|_city)$/, '');
                    const layerValues = layerDataByArcgisId[arcgislayerId];
                    const suffix = match.match(/(last|total|first|year|city)$/)?.[0];

                    if (layerValues) {
                        switch (suffix) {
                            case 'last':
                                return Math.round(layerValues.sort((a, b) => b.Year - a.Year)[0]?.Value || 0);
                            case 'first':
                                return Math.round(layerValues.sort((a, b) => a.Year - b.Year)[0]?.Value || 0);
                            case 'total':
                                return Math.round(layerValues.reduce((sum, entry) => sum + (entry.Value || 0), 0));
                            case 'city':
                                return layerValues[0]?.City || "No data";
                            default:
                                const [value] = layerValues.sort((a, b) => a.Year - b.Year).filter((entry, index, arr) => {
                                    return arr.findIndex(e => e.Year === entry.Year) === index;
                                });
                                return Math.round(value?.Value || 0);
                        }
                    }
                    return 0;
                });

                try {
                    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(eval(evaluatedFormula));
                } catch (error) {
                    console.error('Error evaluating formula:', formula, error);
                    return "No data";
                }
            };

            placeholders.forEach((placeholder) => {
                const decimals = decimalConfig[placeholder] || decimalConfig.default;

                if (placeholder.includes('=')) {
                    const [varName, formula] = placeholder.split('=').map((str) => str.trim());
                    const result = evaluateFormula(formula);
                    calculatedValues[varName] = Number(result).toFixed(decimals);
                    tooltips[varName] = `Calculated from formula: ${formula}`;
                } else {
                    const arcgislayerId = placeholder.split(/(_year|_total|_last|_first|_city|_city_1_value|_city_2_value|_city_1|_city_2)/)[0].trim();
                    const layer = layerDataByArcgisId[arcgislayerId];

                    if (!layer || layer.length === 0) {
                        calculatedValues[placeholder] = "[No data]";
                        tooltips[placeholder] = "No data available for this placeholder";
                        return;
                    }

                    let replacementValue = "[No data]";
                    let tooltipText = "Data sourced from layer";

                    if (/_(Year|year)_first$/.test(placeholder)) {
                        const firstYearEntry = [...layer].sort((a, b) => a.Year - b.Year)[0];
                        replacementValue = firstYearEntry?.Year?.toString() || "[No data]";
                        tooltipText = "First year available in data";
                    } else if (/_(Year|year)_last$/.test(placeholder)) {
                        const lastYearEntry = [...layer].sort((a, b) => b.Year - a.Year)[0];
                        replacementValue = lastYearEntry?.Year?.toString() || "[No data]";
                        tooltipText = "Last year available in data";
                    } else if (/_(Year|year)$/.test(placeholder)) {
                        replacementValue = layer[0]?.Year?.toString() || "[No data]";
                        tooltipText = "Year associated with the data";
                    } else if (/total$/i.test(placeholder)) {
                        const totalSum = layer.reduce((sum, entry) => sum + (entry.Value || 0), 0);
                        replacementValue = new Intl.NumberFormat().format(Math.round(totalSum));
                        tooltipText = "Total value calculated";
                    } else if (/city_1$/i.test(placeholder)) {
                        replacementValue = layer[0]?.City || "[No data]";
                    } else if (/city_2$/i.test(placeholder)) {
                        replacementValue = layer[1]?.City || "[No data]";
                    } else if (/city$/i.test(placeholder)) {
                        replacementValue = layer[0]?.City || "[No data]"
                    } else {
                        replacementValue = new Intl.NumberFormat(undefined, {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals
                        }).format(
                            Math.round(layer.sort((a, b) => b.Year - a.Year)[0]?.Value * 100) / 100 || 0
                        );
                        tooltipText = "Value calculated from the latest available data";
                    }

                    calculatedValues[placeholder] = replacementValue;
                    tooltips[placeholder] = tooltipText;
                }
            });

            ctx.set('Content-Type', 'application/json');
            ctx.send({ placeholders: calculatedValues, tooltips, categoryText: category.textTemplate.template });

        } catch (error) {
            console.error('Error in replacePlaceholders:', error);
            ctx.badRequest('An error occurred', { error });
        }
    },
};
