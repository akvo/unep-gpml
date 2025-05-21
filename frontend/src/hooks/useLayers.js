
import useQueryParameters from "./useQueryParameters";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import LabelClass from "@arcgis/core/layers/support/LabelClass.js";
import useLayerInfo from "./useLayerInfo";

const useLayers = (renderers, layerFromQuery) => {
  const allLayers = useLayerInfo()
  let layersFromQuery
  if (layerFromQuery) {
    layersFromQuery = allLayers?.layers.filter(lay => lay.attributes.arcgislayerId === layerFromQuery)
  }
  const featureLayersMap = [];
  const featureLayers = layersFromQuery?.reverse().map(layer => {
    const baseUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${layer.attributes.arcgislayerId}/FeatureServer`;

    const url = layer?.attributes.featureId ? `${baseUrl}/${layer?.attributes.featureId}` : baseUrl;
    const layerRendererObject = renderers.find(renderer => renderer.key === layer?.attributes.name)
    const renderer = layerRendererObject ? layerRendererObject.renderer : null

    const parts = layer?.attributes?.outFields?.split(',');

    const arrayFields = []
    const quotedParts = parts?.map(part => `${part}`);

    quotedParts?.forEach(element => {
      arrayFields.push(element)
    });

    try {
      const featureLayer =
        (layer?.attributes.arcgisMapId !== null && layer?.attributes.layerMappingId === null) ? new FeatureLayer({
          portalItem: {
            id: layer.attributes.arcgisMapId,
          },
        }) :
          new FeatureLayer({
            url: url,
            outFields: arrayFields,
            ...(layer.attributes.arcgisMapId !== null ? { renderer: renderer } : {}),
            labelingInfo: [new LabelClass({
              labelExpressionInfo: { expression: `$feature.${layer?.attributes.labelField || "NAME"}` },
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
          });

      featureLayersMap.push(featureLayer)

      featureLayer.load().then(() => {

      }).catch((error) => {
        console.error("Error loading the feature layer:", error);
      });

      return featureLayer;
    } catch (error) {
      console.error("Error creating FeatureLayer:", error);
      return null;
    }
  }).filter(layer => layer !== null);

  return featureLayersMap;
};

export default useLayers;

const keyToDisplayName = {
  "pw_generated_kg_cap_yr": "Observation value",
  "year": "Year",
  "pw_collected_pct": "Observation value",
  "Time_Period": "Year",
  "OBS_Value": "Observation value",
  "obsTime": "Year",
  "obsValue": "Observation value",
  "TIME_DETAIL": "Year",
  "plastic": "Plastic",
  "area_km2_1": "Area",
  "Aggregated_OBS_Value": "Observation value",
  "pw_generated_tons_yr": "Observation value",
  "Export_from_tot_tons_to_ocean": "Observation value",
  "Export_from_tot_tons": "Observation value",
  "Waste_tot_tons_to_Country": "Observation value",
  "Export_from_tot_tons_to_beach": "Observation value",
  "romnam": "Country",
  "ROMNAM": "Country",
};