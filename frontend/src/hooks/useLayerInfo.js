import axios from "axios";
import { useEffect, useState } from "react";
import { getStrapiUrl } from "../utils/misc";
import { useRouter } from "next/router";

const useLayerInfo = () => {
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl();
    const router = useRouter();

    useEffect(() => {

        const fetchLayers = async () => {
            try {
                const response = await axios.get(
                    `${strapiURL}/api/layers?locale=${router.locale}&pagination[pageSize]=200`
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
