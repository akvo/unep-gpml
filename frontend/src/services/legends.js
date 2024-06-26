import axios from 'axios'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
export const getLegends = async (layerId, arcgisMapId, layerMappingId) => {
  try {

    let response = null;
    if (arcgisMapId !== null && layerMappingId !== null) {
      response = await axios.get(
        `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${layerId}/FeatureServer/0?f=json`
      )

    } else {
      response = new FeatureLayer({
        portalItem: {
          id: arcgisMapId
        }
      })
    }

    return response
  } catch (error) {
    return null
  }
}
