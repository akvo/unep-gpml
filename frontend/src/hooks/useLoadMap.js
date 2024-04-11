import { useEffect, useState } from "react";
import WebMap from "@arcgis/core/WebMap.js";
import useQueryParameters from "./useQueryParameters";
import { isEqual } from "lodash";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const useLoadMap = () => {
  const { queryParameters } = useQueryParameters();
  const { layers: layersFromQuery } = queryParameters;

  const [renderers, setRenderers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prevLayersFromQuery, setPrevLayersFromQuery] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    let webMap = null;
    const loadWebMapLayer = async (layer) => {
      if (layer.attributes.arcgisMapId) {

        if (layer.attributes.layerMappingId === null) {

          webMap = new FeatureLayer({
            portalItem: {
              id: layer.attributes.arcgisMapId
            }
          })

        } else {
          webMap = new WebMap({
            portalItem: {
              id: layer.attributes.arcgisMapId
            }
          });
        }


        await webMap.load();
        return layer.attributes.layerMappingId !== null ? webMap?.layers?.getItemAt(layer.attributes.layerMappingId)?.renderer : webMap;
      }
      return null;
    };

    const loadWebMapLayers = async () => {
      setIsLoading(true);
      try {
        const renderersList = [];
        for (const layer of layersFromQuery) {
          const loadedRenderer = await loadWebMapLayer(layer);

          if (loadedRenderer) {
            renderersList.push({ key: layer.attributes.name, renderer: loadedRenderer });
          }
        }


        setRenderers(renderersList);

      } catch (error) {
        console.error("Failed to load web map or layers", error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (!isEqual(layersFromQuery, prevLayersFromQuery)) {
      loadWebMapLayers();
      setPrevLayersFromQuery(layersFromQuery);
    }


    return () => {
      isCancelled = true;
    };

  }, [layersFromQuery]);


  return { renderers, isLoading };
};

export default useLoadMap;
