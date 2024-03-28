import useQueryParameters from './useQueryParameters'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js'
import LabelClass from '@arcgis/core/layers/support/LabelClass.js'

const useLayers = (renderers) => {
  const { queryParameters } = useQueryParameters()
  const { layers: layersFromQuery } = queryParameters

  const featureLayers = layersFromQuery
    .reverse()
    .map((layer) => {
      const baseUrl = `https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/${layer.arcgislayerId}/FeatureServer`
      const url = layer.featureId ? `${baseUrl}/${layer.featureId}` : baseUrl

      const layerRendererObject = renderers.find(
        (renderer) => renderer.key === layer.name
      )

      const renderer = layerRendererObject ? layerRendererObject.renderer : null

      const parts = layer?.outFields?.split(',')

      const arrayFields = []
      const quotedParts = parts?.map((part) => `${part}`)

      quotedParts?.forEach((element) => {
        arrayFields.push(element)
      })

      try {
        const featureLayer = new FeatureLayer({
          url: url,
          outFields: arrayFields ? arrayFields : ['*'],
          ...(layer.arcgisMapId !== null ? { renderer: renderer } : {}),
          labelingInfo: [
            new LabelClass({
              labelExpressionInfo: layer.labelExpression
                ? { expression: '$feature.NAME' }
                : '',
              symbol: {
                type: 'text',
                color: '#000000',
                haloColor: 'white',
                haloSize: '2px',
                font: {
                  family: 'Arial',
                  size: 8,
                  weight: 'bold',
                },
              },
            }),
          ],
          popupTemplate: {
            title: '{origin} {destination}',
            content: async function (feature) {
              const attributes = feature.graphic.attributes
              const domainPromises = Object.entries(attributes).map(
                async ([key, value]) => {
                  try {
                    const domain = await featureLayer.getFieldDomain(key)
                    const displayValue = domain
                      ? domain.codedValues.find((cv) => cv.code === value)?.name
                      : value
                    return `<div class="popup-field">
                          <strong class="popup-field-name">${key}:</strong>
                          <span class="popup-field-value">${displayValue}</span>
                        </div>`
                  } catch (error) {
                    console.error('Error getting field domain:', error)
                    return `<div class="popup-field">
                          <strong class="popup-field-name">${key}:</strong>
                          <span class="popup-field-value">${value}</span>
                        </div>`
                  }
                }
              )

              const contentElements = await Promise.all(domainPromises)
              return `<div class="popup-content">${contentElements.join(
                ''
              )}</div>`
            },
          },
        })

        featureLayer
          .load()
          .then(() => {
            if (featureLayer.popupTemplate) {
              console.log('PopupTemplate fields:', featureLayer)
            } else {
              console.log(
                'No predefined popupTemplate found. Consider defining one manually.'
              )
            }
          })
          .catch((error) => {
            console.error('Error loading the feature layer:', error)
          })

        return featureLayer
      } catch (error) {
        console.error('Error creating FeatureLayer:', error)
        return null
      }
    })
    .filter((layer) => layer !== null)

  console.log('Feature layers created:', featureLayers)

  return featureLayers
}

export default useLayers
