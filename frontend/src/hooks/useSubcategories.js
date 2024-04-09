import axios from "axios";
import { useEffect, useState } from "react";

const useSubcategories = () => {
  const [subcategories, setSubategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubategories = async () => {
      try {
        const response = await axios.get(
          `https://unep-gpml.akvotest.org/strapi/api/subcategories?pagination[pageSize]=100`
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
