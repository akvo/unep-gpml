import axios from "axios";
import { useEffect, useState } from "react";
import { getStrapiUrl } from "../utils/misc";

const useLayerInfo = () => {
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl();
    useEffect(() => {

        const fetchLayers = async () => {
            try {
                const response = await axios.get(
                    `${strapiURL}/api/layers?pagination[pageSize]=100`
                );

                setLayers(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching Layers:", error);
                setLoading(false);
            }
        };


        fetchLayers();
    }, []);

    return { layers, loading };
};

export default useLayerInfo;
