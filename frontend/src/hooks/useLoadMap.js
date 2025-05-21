import { useEffect, useState } from "react";
import WebMap from "@arcgis/core/WebMap.js";
import useQueryParameters from "./useQueryParameters";
import { isEqual } from "lodash";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const useLoadMap = (layers) => {

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
              id: layer?.attributes?.arcgisMapId
            }
          })

        } else {
          webMap = new WebMap({
            portalItem: {
              id: layer?.attributes.arcgisMapId
            }
          });
        }


        await webMap?.load();
        return layer.attributes.layerMappingId !== null ? webMap?.layers?.getItemAt(layer?.attributes.layerMappingId)?.renderer : webMap;
      }
      return null;
    };

    const loadWebMapLayers = async () => {
      setIsLoading(true);
      try {
        const renderersList = [];
        const selectedLayers = Array.isArray(layers) ? layers : Array.isArray(layers) ? layers : [];

        for (const layer of selectedLayers) {
          const loadedRenderer = await loadWebMapLayer(layer);
          if (loadedRenderer) {
            renderersList.push({ key: layer?.attributes.name, renderer: loadedRenderer });
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

    if (!isEqual(layers, prevLayersFromQuery)) {
      loadWebMapLayers();
      setPrevLayersFromQuery(layers);
    }


    return () => {
      isCancelled = true;
    };

  }, [layers]);


  return { renderers, isLoading };
};

export default useLoadMap;
