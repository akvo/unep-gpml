import { useEffect, useState } from 'react';
import axios from 'axios';

const useReplacedText = (country, categoryId, regionMswValue) => {
    const [replacedText, setReplacedText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReplacedText = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${strapiURL}/api/category/category-replace/${country}/${categoryId}/${regionMswValue.toString()}`);
                setReplacedText(data.replacedText || '');
            } catch (error) {
                console.error('Error fetching replaced text:', error);
            } finally {
                setLoading(false);
            }
        };

        if (country && categoryId) fetchReplacedText();
    }, [country, categoryId]);

    return { replacedText, loading };
};

export default useReplacedText;
