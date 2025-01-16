import axios from "axios";
import { useEffect, useState } from "react";
import { getStrapiUrl } from "../utils/misc";
import { useRouter } from "next/router";

const useCategories = () => {
  const router = useRouter()
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const strapiURL = getStrapiUrl();

  useEffect(() => {

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${strapiURL}/api/categories?locale=${router.locale}&sort[order]=asc`
        );

        setCategories(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };


    fetchCategories();
  }, [router.locale]);

  return { categories, loading };
};

export default useCategories;
