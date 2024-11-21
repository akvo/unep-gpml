import { useEffect, useState } from 'react';
import axios from 'axios';
import { getStrapiUrl } from '../utils/misc';

const useReplacedText = (country, categoryId) => {
    const [placeholders, setPlaceholders] = useState({});
    const [tooltips, setTooltips] = useState({});
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl();

    useEffect(() => {
        const fetchReplacedText = async () => {
            setLoading(true);
            try {
                //TODO: RETURN STRAPI URL
                const response = await axios.get(
                    `${strapiURL}/api/category/category-replace/${country}/${categoryId}`
                );


                if (response && response.data) {
                    setPlaceholders(response.data.placeholders || {});
                    setTooltips(response.data.tooltips || {});
                } else {
                    console.error('Invalid response structure:', response);
                }
            } catch (error) {
                console.error('Error fetching replaced text:', error);
            } finally {
                setLoading(false);
            }
        };

        if (country && categoryId) {
            fetchReplacedText();
        }
    }, [country, categoryId, strapiURL]);
    console.log('test', placeholders)
    return { placeholders, tooltips, loading };
};

export default useReplacedText;
