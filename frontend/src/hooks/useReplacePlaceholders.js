import { useEffect, useState } from 'react';
import axios from 'axios';
import { getStrapiUrl } from '../utils/misc';

const useReplacedText = (country, categoryId) => {
    const [replacedText, setReplacedText] = useState('');
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl();

    useEffect(() => {
        const fetchReplacedText = async () => {
            setLoading(true);
            try {


                const response = await axios.get(
                    `${strapiURL}/api/category/category-replace/${country}/${categoryId}`
                );

                if (response && response.data && response.data.replacedText) {
                    setReplacedText(response.data.replacedText);
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

    return { replacedText, loading };
};

export default useReplacedText;