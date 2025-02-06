import axios from 'axios';
import { useEffect, useState } from 'react';
import { getStrapiUrl } from '../utils/misc';
import { useRouter } from 'next/router';

const useLayers = () => {
    const router = useRouter()
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl()

    useEffect(() => {

        const fetchLayers = async () => {
            try {
                const response = await axios.get(
                    `${strapiURL}/api/layers?locale=${router.locale}&pagination[pageSize]=150&sort[order]=asc`
                );

                setLayers(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching layers:", error);
                setLoading(false);
            }
        };


        fetchLayers();
    }, [router.locale]);

    return { layers, loading };
};
export default useLayers;
