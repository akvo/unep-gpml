import { useEffect, useState } from 'react';
import axios from 'axios';
import { getStrapiUrl } from '../utils/misc';

const useReplacedText = (country, countryCode, categoryId, placeholders) => {

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
                    }
                );

                if (response && response.data) {
                    setPlaceholdersData(response.data.placeholders || {});
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

        if (country && categoryId && placeholders?.length) {
            fetchReplacedText();
        }
    }, [country, categoryId, placeholders, strapiURL]);

    return { placeholders: placeholdersData, tooltips, loading };
};

export default useReplacedText;
