import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getStrapiUrl } from '../utils/misc';

const useReplacedText = (country, countryCode, categoryId, placeholders, layerJson) => {
    const [placeholdersData, setPlaceholdersData] = useState({});
    const [tooltips, setTooltips] = useState({});
    const [loading, setLoading] = useState(true);
    const strapiURL = getStrapiUrl();
    const abortRef = useRef(null);

    useEffect(() => {
        // Cancel any in-flight request from a previous render
        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

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
                    },
                    { signal: controller.signal }
                );

                if (response?.data) {
                    setPlaceholdersData(response.data.placeholders || {});
                    setTooltips(response.data.tooltips || {});
                } else {
                    console.error('Invalid API response structure:', response);
                }
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Error fetching replaced text:', error.message || error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (country && categoryId && Array.isArray(placeholders) && placeholders.length > 0) {
            // Reset stale data from previous country before fetching
            setPlaceholdersData({});
            setTooltips({});
            fetchReplacedText();
        } else {
            setLoading(false);
        }

        return () => controller.abort();
    }, [country, countryCode, categoryId, placeholders, layerJson, strapiURL]);

    return { placeholders: placeholdersData, tooltips, loading };
};

export default useReplacedText;
