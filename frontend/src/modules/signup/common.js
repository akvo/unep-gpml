export default {
  feedCountry: (data, formData, group) => {
    if (data.country?.[formData[group].country]) {
      data.country = formData[group].country;
    }
  },
  feedSeeking: (data, formData) => {
    if (data.seeking) {
      data.seeking = data.seeking.map((x) => Number(x));
    }
  },
  feedOffering: (data, formData) => {
    if (data.offering) {
      data.offering = data.offering.map((x) => Number(x));
    }
  },
  feedTitle: (data, formData, group) => {
    if (data.title?.[formData[group].titleAndLastName.title]) {
      data.title = formData[group].titleAndLastName.title;
    }
  },
};
