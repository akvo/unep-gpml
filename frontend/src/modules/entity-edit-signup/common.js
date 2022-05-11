export default {
  feedCountry: (data, formData, group) => {
    if (data.country?.[formData[group].country]) {
      data.country = formData[group].country;
    }
  },
  feedSeeking: (data, formData, tags) => {
    if (data.seeking) {
      data.seeking = data.seeking.map((x) => {
        return {
          ...(!isNaN(parseInt(x)) && { id: parseInt(x) }),
          tag:
            Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x))?.tag || x.toLowerCase(),
          tag_category: "seeking",
        };
      });
    }
  },
  feedOffering: (data, formData, tags) => {
    if (data.offering) {
      data.offering = data.offering.map((x) => {
        return {
          ...(!isNaN(parseInt(x)) && { id: parseInt(x) }),
          tag:
            Object.values(tags)
              .flat()
              .find((o) => o.id === parseInt(x))?.tag || x.toLowerCase(),
          tag_category: "offering",
        };
      });
    }
  },
  feedTitle: (data, formData, group) => {
    if (data.title?.[formData[group].titleAndLastName.title]) {
      data.title = formData[group].titleAndLastName.title;
    }
  },
};
