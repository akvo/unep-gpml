const axios = require('axios');

module.exports = {
    async replacePlaceholders(ctx) {
        try {
            const decimalConfig = {
                default: 0,
                Municipal_solid_waste_generated_annually_V3_WFL1: 0,
                Proportion_of_municipal_waste_recycled_13_10_24_WFL1: 2,
                Municipal_solid_waste_generated_daily_per_capita_V3_WFL1: 2,
                MSW_generation_rate__kg_cap_day__WFL1: 2,
                total: 0,
                last: 2,
                first: 2,
            };

            const { country, countryCode, placeholders: clientPlaceholders, layerJson } = ctx.request.body;


            const layerDataByArcgisId = {};
            const placeholdersLayers = JSON.parse(layerJson)

            placeholdersLayers.forEach(layer => {
                if (layer && layer.attributes) {
                    const { arcgislayerId, ValuePerCountry } = layer.attributes;
                    layerDataByArcgisId[arcgislayerId] = {
                        values: (ValuePerCountry?.filter(c => c.CountryCode ? c.CountryCode === countryCode : c.CountryName.replace(/\s+/g, '') === decodeURIComponent(country).replace(/\s+/g, ''))) || [],
                        datasource: layer.attributes.dataSource || "Unknown source"
                    };
                }
            });

            const calculatedValues = {};
            const tooltips = {};

            const evaluateFormula = (formula) => {
                const evaluatedFormula = formula.replace(/\b(\w+_\w+(_\w+)*)\b/g, (match) => {
                    const arcgislayerId = match.replace(/(_year|_total|_last|_first|_city)$/, '');
                    const layerInfo = layerDataByArcgisId[arcgislayerId];
                    const layerValues = layerInfo?.values;

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

            clientPlaceholders.forEach((placeholder) => {
                const decimals = decimalConfig[placeholder] || decimalConfig.default;

                if (placeholder === 'country') {
                    calculatedValues[placeholder] = decodeURIComponent(country) || "[No data]";
                    tooltips[placeholder] = "Selected country";
                    return;
                }

                if (placeholder.includes('=')) {
                    const [varName, formula] = placeholder.split('=').map((str) => str.trim());
                    const result = evaluateFormula(formula);
                    const datasource = "Calculated from formula";
                    const replaceComma = parseFloat(result.replace(",", "."));
                    calculatedValues[varName] = !isNaN(Number(result))
                      ? Number(result).toFixed(2)
                      : Number(replaceComma).toFixed(2);
                    tooltips[varName] = `${datasource}`;
                } else {
                    const arcgislayerId = placeholder.split(/(_year|_total|_last|_first|_city|_city_1_value|_city_2_value|_city_1|_city_2)/)[0].trim();
                    const layerInfo = layerDataByArcgisId[arcgislayerId];
                    const layer = layerInfo?.values;
                    const datasource = layerInfo?.datasource || "Unknown source";

                    if (!layer || layer.length === 0) {
                        calculatedValues[placeholder] = "[No data]";
                        tooltips[placeholder] = `${datasource}`;
                        return;
                    }

                    let replacementValue = "[No data]";
                    let tooltipText = `${datasource}`;

                    if (/_(Year|year)_first$/.test(placeholder)) {
                        const firstYearEntry = [...layer].sort((a, b) => a.Year - b.Year)[0];
                        replacementValue = firstYearEntry?.Year?.toString() || "[No data]";
                        tooltipText = ` ${datasource}`;
                    } else if (/_(Year|year)_last$/.test(placeholder)) {
                        const lastYearEntry = [...layer].sort((a, b) => b.Year - a.Year)[0];
                        replacementValue = lastYearEntry?.Year?.toString() || "[No data]";
                        tooltipText = `${datasource}`;
                    } else if (/_(Year|year)$/.test(placeholder)) {
                        replacementValue = layer[0]?.Year?.toString() || "[No data]";
                        tooltipText = `${datasource}`;
                    } else if (/total$/i.test(placeholder)) {
                        const totalSum = layer.reduce((sum, entry) => sum + (entry.Value || 0), 0);
                        replacementValue = new Intl.NumberFormat().format(Math.round(totalSum));
                        tooltipText = ` ${datasource}`;
                    } else if (/city_2_value$/i.test(placeholder)) {
                        const arcgislayerId = placeholder.split(/(_city_2_value)/)[0].trim();
                        const city2Value = layer[1]?.Value;
                        if (arcgislayerId === "MSW_generation_rate__kg_cap_day__WFL1") {
                            replacementValue = city2Value !== undefined
                                ? city2Value.toFixed(2)
                                : "[No data]";
                        } else {
                            replacementValue = city2Value !== undefined
                                ? Math.round(city2Value).toString()
                                : "[No data]";
                        }
                        tooltipText = datasource;
                    } else if (/city_1_value$/i.test(placeholder)) {
                        const arcgislayerId = placeholder.split(/(_city_1_value)/)[0].trim();
                        const city1Value = layer[0]?.Value;
                        if (arcgislayerId === "MSW_generation_rate__kg_cap_day__WFL1") {
                            replacementValue = city1Value !== undefined
                                ? city1Value.toFixed(2)
                                : "[No data]";
                        } else {
                            replacementValue = city1Value !== undefined
                                ? Math.round(city1Value).toString()
                                : "[No data]";
                        }
                        tooltipText = datasource;


                    } else if (/city_1$/i.test(placeholder)) {
                        replacementValue = layer[0]?.City || "[No data]";
                    } else if (/city_2$/i.test(placeholder)) {
                        replacementValue = layer[1]?.City || "[No data]";
                    } else if (/city$/i.test(placeholder)) {
                        replacementValue = layer[0]?.City || "[No data]";
                    } else {
                        replacementValue = new Intl.NumberFormat(undefined, {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals
                        }).format(
                            Math.round(layer.sort((a, b) => b.Year - a.Year)[0]?.Value * 100) / 100 || 0
                        );
                        tooltipText = `${datasource}`;
                    }

                    calculatedValues[placeholder] = replacementValue;
                    tooltips[placeholder] = tooltipText;
                }
            });

            ctx.set('Content-Type', 'application/json');

            ctx.send({ placeholders: calculatedValues, tooltips });

        } catch (error) {
            console.error('Error in replacePlaceholders:', error);
            ctx.badRequest('An error occurred', { error });
        }
    },
};
