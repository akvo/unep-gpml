'use strict';

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
                placeholders.map(placeholder => placeholder.replace(/_(Year|year)$/, ''))
            )];

            const layers = await strapi.entityService.findMany('api::layer.layer', {
                filters: { arcgislayerId: uniqueLayerIds },
                populate: { ValuePerCountry: true }
            });

            if (!layers || layers.length === 0) {
                return ctx.notFound('Layers not found');
            }

            const layerMap = new Map();
            layers.forEach(layer => {
                layerMap.set(layer.arcgislayerId, layer);
            });

            let replacedText = template;

            for (const placeholder of placeholders) {
                const arcgislayerId = placeholder.replace(/_(Year|year)$/, '');

                const layer = layerMap.get(arcgislayerId);

                if (!layer) continue;

                const countryData = layer.ValuePerCountry.find(c => c.CountryName === country);

                if (!countryData) continue;

                console.log('Matching data for placeholder:', placeholder, ' - Data:', countryData);

                if (/_Year$|_year$/.test(placeholder)) {
                    replacedText = replacedText.replace(
                        new RegExp(`{{${placeholder}}}`, 'g'),
                        countryData?.Year?.toString() || "No data"
                    );
                } else {
                    replacedText = replacedText.replace(
                        new RegExp(`{{${placeholder}}}`, 'g'),
                        countryData?.Value?.toString() || "No data"
                    );
                }
            }
            replacedText = replacedText.replace(
                /{{country}}/g,
                country || "No country specified"
            );
            ctx.send({ replacedText });
        } catch (error) {
            console.error('Error in replacePlaceholders:', error);
            ctx.badRequest('An error occurred', { error });
        }
    },
};