import useQueryParameters from "./useQueryParameters";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import LabelClass from "@arcgis/core/layers/support/LabelClass.js";

const useLayers = (renderers) => {
  const { queryParameters } = useQueryParameters();
  const { layers: layersFromQuery } = queryParameters;

  const featureLayers = layersFromQuery.reverse().map(layer => {
    const baseUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${layer.attributes.arcgislayerId}/FeatureServer`;

    const url = layer.attributes.featureId ? `${baseUrl}/${layer.attributes.featureId}` : baseUrl;
    const layerRendererObject = renderers.find(renderer => renderer.key === layer.attributes.name);
    const renderer = layerRendererObject ? layerRendererObject.renderer : null;

    const parts = layer?.attributes.outFields?.split(',');


    const arrayFields = []
    const quotedParts = parts?.map(part => `${part}`);

    quotedParts?.forEach(element => {
      arrayFields.push(element)


    });

    try {
      const featureLayer =
        (layer.attributes.arcgisMapId !== null && layer.attributes.layerMappingId === null) ? new FeatureLayer({
          portalItem: {
            id: layer.attributes.arcgisMapId,
          },
        }) :
          new FeatureLayer({
            url: url,
            outFields: arrayFields,
            ...(layer.attributes.arcgisMapId !== null ? { renderer: renderer } : {}),
            labelingInfo: [new LabelClass({
              labelExpressionInfo: { expression: `$feature.${layer.attributes.labelField || "NAME"}` },
              symbol: {
                type: "text",
                color: "#000000",
                haloColor: "white",
                haloSize: "2px",
                font: {
                  family: "Arial",
                  size: 8,
                  weight: "bold"
                }
              }
            })],
            popupTemplate: {
              title: `{ROMNAM}`,
              content: ({ graphic }) => {
                const attributes = graphic.attributes;
                return arrayFields.map(field => {
                  const displayKey = keyToDisplayName[field] || field;
                  const displayValue = attributes[field];
                  return `<div class="popup-field">
                <strong class="popup-field-name">${displayKey}:</strong>
                <span class="popup-field-value">${displayValue}</span>
              </div>`;
                }).join('');
              }
            }
          });

      featureLayer.load().then(() => {
        console.log("Layer loaded:", featureLayer);
      }).catch(error => {
        console.error("Error loading the feature layer:", error);
      });

      return featureLayer;
    } catch (error) {
      console.error("Error creating FeatureLayer:", error);
      return null;
    }
  }).filter(layer => layer !== null);

  return featureLayers;
};

export default useLayers;

const keyToDisplayName = {
  "pw_generated_kg_cap_yr": "Observed value",
  "year": "Year",
  "pw_collected_pct": "Observed value",
  "Time_Period": "Year",
  "OBS_Value": "Observed value",
  "obsTime": "Year",
  "obsValue": "Observed value",
  "TIME_DETAIL": "Year",
  "plastic": "Plastic",
  "area_km2_1": "Area",
  "Aggregated_OBS_Value": "Observed value",
  "pw_generated_tons_yr": "Observed value",
  "romnam": "Country"
};