const axios = require('axios');

module.exports = {
    async replacePlaceholders(ctx) {
        try {
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

            //TODO: Replace this url with dynamic
            const layerData = await Promise.all(uniqueLayerIds.map(async (layerId) => {
                const response = await axios.get(`https://unep-gpml.akvotest.org/strapi/api/layers?filters[arcgislayerId][$eq]=${layerId}&populate=ValuePerCountry`);
                return response.data?.data[0];
            }));

            console.log(layerData)
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

            let replacedText = template;
            const calculatedValues = {};

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


            placeholders.forEach(placeholder => {


                if (placeholder.includes('=')) {
                    const [varName, formula] = placeholder.split('=').map(str => str.trim());
                    const result = evaluateFormula(formula);

                    calculatedValues[varName] = result;
                } else {
                    const arcgislayerId = placeholder.split(/(_year|_total|_last|_first|_city)/)[0].trim();
                    const layer = layerDataByArcgisId[arcgislayerId];

                    if (!layer || layer.length === 0) return;

                    let replacementValue = "No data";

                    if (/_(Year|year)_first$/.test(placeholder)) {
                        const firstYearEntry = [...layer].sort((a, b) => a.Year - b.Year)[0];
                        replacementValue = firstYearEntry?.Year?.toString() || "No data";

                    } else if (/_(Year|year)_last$/.test(placeholder)) {
                        const lastYearEntry = [...layer].sort((a, b) => b.Year - a.Year)[0];
                        replacementValue = lastYearEntry?.Year?.toString() || "No data";

                    } else if (/_(Year|year)$/.test(placeholder)) {
                        replacementValue = layer[0]?.Year?.toString() || "No data";

                    } else if (/total$/i.test(placeholder)) {
                        const totalSum = layer.reduce((sum, entry) => sum + (entry.Value || 0), 0);
                        replacementValue = new Intl.NumberFormat().format(Math.round(totalSum));

                    } else if (/city$/i.test(placeholder)) {
                        replacementValue = layer[0]?.City || "No data";

                    } else {
                        replacementValue = new Intl.NumberFormat().format(
                            Math.round(layer.sort((a, b) => b.Year - a.Year)[0]?.Value || 0)
                        );
                    }

                    calculatedValues[placeholder] = replacementValue;
                }
            });

            for (const [placeholder, value] of Object.entries(calculatedValues)) {
                const escapedPlaceholder = placeholder.replace(/([()*+?.^$|[\]\\])/g, '\\$1');
                replacedText = replacedText.replace(new RegExp(`{{${escapedPlaceholder}}}`, 'g'), value.toString());
            }

            replacedText = replacedText.replace(/{{country}}/g, country || "No country specified");

            ctx.set('Content-Type', 'text/html');
            ctx.send({ replacedText });

        } catch (error) {
            console.error('Error in replacePlaceholders:', error);
            ctx.badRequest('An error occurred', { error });
        }
    },
};