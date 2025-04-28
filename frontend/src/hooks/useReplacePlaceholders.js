import { useEffect, useState } from 'react';
import axios from 'axios';
import { getStrapiUrl } from '../utils/misc';

const useReplacedText = (country, countryCode, categoryId, placeholders, layerJson) => {
    const [placeholdersData, setPlaceholdersData] = useState({});
    const [tooltips, setTooltips] = useState({});
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl();

    useEffect(() => {
        const fetchReplacedText = async () => {
            setLoading(true);
            try {
                const response = await axios.post(
                    `${strapiURL}/api/category/category-replace`,
                    {
                        country,
                        countryCode,
                        categoryId,
                        placeholders,
                        layerJson,
                    }
                );

                if (response?.data) {
                    // console.log('API response:', response.data);
                    setPlaceholdersData(response.data.placeholders || {});
                    setTooltips(response.data.tooltips || {});
                } else {
                    console.error('Invalid API response structure:', response);
                }
            } catch (error) {
                console.error('Error fetching replaced text:', error.message || error);
            } finally {
                setLoading(false);
            }
        };

        if (country && categoryId && Array.isArray(placeholders) && placeholders.length > 0) {
            fetchReplacedText();
        } else {
            console.warn('Insufficient data to fetch replaced text:', {
                country,
                categoryId,
                placeholders,
                layerJson,
            });
        }
    }, [country, countryCode, categoryId, placeholders, layerJson, strapiURL]);

    return { placeholders: placeholdersData, tooltips, loading };
};

export default useReplacedText;
