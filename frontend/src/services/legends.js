import axios from 'axios'

export const getLegends = async (layerId) => {
  try {
    const response = await axios.get(
      `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${layerId}/FeatureServer/0?f=json`
    )

    return response.data
  } catch (error) {
    return null
  }
}
