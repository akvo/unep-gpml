import axios from "axios";
import { useEffect, useState } from "react";

const useSubcategories = (categoryId) => {
  const [subcategories, setSubategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubategories = async () => {
      try {
        const response = await axios.get(
          `https://unep-gpml.akvotest.org/strapi/api/subcategories?filters[categoryId][$eq]=${categoryId}`
        );

        setSubategories(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchSubategories();
  }, [categoryId]);

  return { subcategories, loading };
};

export default useSubcategories;
