import axios from "axios";
import { useEffect, useState } from "react";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://unep-gpml.akvotest.org/strapi/api/categories"
        );

        setCategories(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };


    fetchCategories();
  }, []);

  return { categories, loading };
};

export default useCategories;
