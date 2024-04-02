import axios from "axios";
import { useEffect, useState } from "react";

const useLayers = (subcategoryId) => {
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLayers = async () => {
            try {

                const response = await axios.get(
                    `https://unep-gpml.akvotest.org/strapi/api/layers?filters[subcategoryId][$eq]=${subcategoryId}&pagination[page]=1&pagination[pageSize]=1000`
                );

                setLayers(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };

        fetchLayers();
    }, [subcategoryId]);

    return { layers, loading };
};

export default useLayers;
