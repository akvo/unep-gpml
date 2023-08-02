import React, { useEffect } from "react";
import Landing from "../modules/landing/landing";
import api from "../utils/api";
import { UIStore } from "../store";
import { uniqBy, sortBy } from "lodash";

function HomePage({ isAuthenticated, data, communityData }) {
  UIStore.update((s) => {
    Object.assign(s, data);
  });

  return (
    <Landing communityData={communityData} isAuthenticated={isAuthenticated} />
  );
}

export default HomePage;

export async function getServerSideProps() {
  const res = await Promise.all([
    api.get("https://digital.gpmarinelitter.org/api/tag"),
    api.get("https://digital.gpmarinelitter.org/api/currency"),
    api.get("https://digital.gpmarinelitter.org/api/country"),
    api.get("https://digital.gpmarinelitter.org/api/country-group"),
    api.get("https://digital.gpmarinelitter.org/api/organisation"),
    api.get("https://digital.gpmarinelitter.org/api/nav"),
    api.get("https://digital.gpmarinelitter.org/api/stakeholder"),
    api.get("https://digital.gpmarinelitter.org/api/non-member-organisation"),
    api.get(
      "https://digital.gpmarinelitter.org/api/community?representativeGroup=Government"
    ),
  ]);

  const [
    tag,
    currency,
    country,
    countryGroup,
    organisation,
    nav,
    stakeholder,
    nonMemberOrganisations,
    community,
  ] = res;

  const data = {
    tags: tag.data,
    currencies: currency.data,
    countries: uniqBy(country.data).sort((a, b) =>
      a.name?.localeCompare(b.name)
    ),
    regionOptions: countryGroup.data.filter((x) => x.type === "region"),
    meaOptions: countryGroup.data.filter((x) => x.type === "mea"),
    transnationalOptions: countryGroup.data.filter(
      (x) => x.type === "transnational"
    ),
    organisations: uniqBy(sortBy(organisation.data, ["name"])).sort((a, b) =>
      a.name?.localeCompare(b.name)
    ),
    nonMemberOrganisations: uniqBy(
      sortBy(nonMemberOrganisations.data, ["name"])
    ).sort((a, b) => a.name?.localeCompare(b.name)),
    nav: nav.data,
    stakeholders: stakeholder.data,
  };

  const communityData = community.data;

  return {
    props: {
      data,
      communityData,
    },
  };
}
