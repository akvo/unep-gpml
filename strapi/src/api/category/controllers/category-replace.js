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

            const layers = await strapi.entityService.findMany('api::layer.layer', {
                filters: { arcgislayerId: uniqueLayerIds },
                populate: { ValuePerCountry: true }
            });

            if (!layers || layers.length === 0) {
                return ctx.notFound('Layers not found');
            }

            const layerDataByArcgisId = {};
            layers.forEach(layer => {
                layerDataByArcgisId[layer.arcgislayerId] = layer.ValuePerCountry.filter(c => c.CountryName === country);
            });

            let replacedText = template;
            const calculatedValues = {};

            const evaluateFormula = (formula) => {
                const evaluatedFormula = formula.replace(/\b(\w+_\w+(_\w+)*)\b/g, (match) => {
                    const arcgislayerId = match.replace(/(_year|_total|_last|_first|_city)$/, '');
                    const layerValues = layerDataByArcgisId[arcgislayerId];
                    const suffix = match.match(/(last|total|first|year|city)$/)?.[0];
                    console.log('Layer Values:', layerValues);

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
                                return Math.round(layerValues.sort((a, b) => b.Year - a.Year)[0]?.Value || 0);
                        }
                    }
                    return 0;
                });

                try {
                    return new Intl.NumberFormat().format(eval(evaluatedFormula));
                } catch (error) {
                    console.error('Error evaluating formula:', formula, error);
                    return "No data";
                }
            };

            placeholders.forEach(placeholder => {
                console.log('Processing placeholder:', placeholder);

                if (placeholder.includes('=')) {
                    const [varName, formula] = placeholder.split('=').map(str => str.trim());
                    const result = evaluateFormula(formula);

                    calculatedValues[varName] = result;
                    console.log(`Calculated value for ${varName}: ${result}`);
                } else {
                    const arcgislayerId = placeholder.split(/(_year|_total|_last|_first|_city)/)[0].trim();
                    const layer = layerDataByArcgisId[arcgislayerId];

                    if (!layer) return;

                    const countryData = layer;
                    if (countryData.length === 0) return;

                    let replacementValue = "No data";

                    if (/_(Year|year)_first$/.test(placeholder)) {
                        const firstYearEntry = [...countryData].sort((a, b) => a.Year - b.Year)[0];
                        replacementValue = firstYearEntry?.Year?.toString() || "No data";

                    } else if (/_(Year|year)_last$/.test(placeholder)) {
                        const lastYearEntry = [...countryData].sort((a, b) => b.Year - a.Year)[0];
                        replacementValue = lastYearEntry?.Year?.toString() || "No data";

                    } else if (/_(Year|year)$/.test(placeholder)) {
                        replacementValue = countryData[0]?.Year?.toString() || "No data";

                    } else if (/total$/i.test(placeholder)) {
                        const totalSum = countryData.reduce((sum, entry) => sum + (entry.Value || 0), 0);
                        replacementValue = new Intl.NumberFormat().format(Math.round(totalSum));

                    } else if (/city$/i.test(placeholder)) {
                        replacementValue = countryData[0]?.City || "No data";

                    } else {
                        replacementValue = new Intl.NumberFormat().format(
                            Math.round(countryData.sort((a, b) => b.Year - a.Year)[0]?.Value || 0)
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