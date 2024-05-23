import axios from "axios";
import { useEffect, useState } from "react";
import { getStrapiUrl } from "../utils/misc";

const useSubcategories = () => {
  const [subcategories, setSubategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const strapiURL = getStrapiUrl();

  useEffect(() => {
    const fetchSubategories = async () => {
      try {
        const response = await axios.get(
          `${strapiURL}/api/subcategories?pagination[pageSize]=100`
        );

        setSubategories(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchSubategories();
  }, []);

  return { subcategories, loading };
};

export default useSubcategories;
