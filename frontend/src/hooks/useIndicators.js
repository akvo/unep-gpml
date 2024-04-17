import axios from 'axios';
import { useEffect, useState } from 'react';

const useLayers = () => {
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchLayers = async () => {
            try {
                const response = await axios.get(
                    `https://unep-gpml.akvotest.org/strapi/api/layers?pagination[pageSize]=100`
                );

                setLayers(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching layers:", error);
                setLoading(false);
            }
        };


        fetchLayers();
    }, []);

    return { layers, loading };
};
export default useLayers;
