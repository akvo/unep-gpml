import axios from 'axios'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
export const getLegends = async (layerId, arcgismapId, layerMappingId) => {
  try {

    let response = null;
    if (arcgismapId !== null && layerMappingId !== null) {
      response = await axios.get(
        `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${layerId}/FeatureServer/0?f=json`
      )

    } else {
      response = new FeatureLayer({
        portalItem: {
          id: arcgismapId
        }
      })
    }

    return response
  } catch (error) {
    return null
  }
}
