import axios from "axios";
import { useEffect, useState } from "react";
import { getStrapiUrl } from "../utils/misc";

const useRegions = () => {
    const strapiURL = getStrapiUrl();
    const [countriesWithRegions, setCountriesWithRegions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegionsAndCountries = async () => {
            try {
                const countryResponse = await axios.get(`${strapiURL}/api/countries/getAllCountries`);

                const countries = countryResponse.data;

                const regionResponse = await axios.get(`${strapiURL}/api/regions`);

                const regions = regionResponse.data.data;

                const mappedCountries = countries.map((country) => {

                    const regionId = country.RegionID;


                    const region = regions.find((reg) => reg.id === regionId);

                    return {
                        ...country,
                        regionMswValue: region
                            ? region.attributes.MSWGenerationPerCapita
                            : null,
                        regionPlasticComposition: region
                            ? region.attributes.PlasticComposition
                            : null,
                    };
                });

                setCountriesWithRegions(mappedCountries);
            } catch (error) {
                console.error("Error fetching regions and countries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegionsAndCountries();
    }, []);

    return { countriesWithRegions, loading };
};

export default useRegions;
