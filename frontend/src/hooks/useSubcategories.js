import axios from "axios";
import { useEffect, useState } from "react";
import { getStrapiUrl } from "../utils/misc";
import { useRouter } from "next/router";

const useSubcategories = () => {
  const [subcategories, setSubategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const strapiURL = getStrapiUrl();
  const router = useRouter();
  console.log('trigger build')
  useEffect(() => {
    const fetchSubategories = async () => {
      try {
        const response = await axios.get(
          `${strapiURL}/api/subcategories?locale=${router.locale}&pagination[pageSize]=100&sort[order]=asc`
        );

        setSubategories(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchSubategories();
  }, [router.locale]);

  return { subcategories, loading };
};

export default useSubcategories;
