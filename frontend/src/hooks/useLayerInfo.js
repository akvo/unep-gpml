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
                    `${strapiURL}/api/layers?pagination[pageSize]=150&sort[order]=asc&populate=ValuePerCountry`
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
