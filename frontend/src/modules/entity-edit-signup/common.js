import { tagsMap } from "../../utils/misc";

export default {
  feedCountry: (data, formData, group) => {
    if (data.country?.[formData[group].country]) {
      data.country = formData[group].country;
    }
  },
  feedSeeking: (data, formData, tags) => {
    if (data.seeking) {
      data.seeking = tagsMap(data.seeking, "seeking", tags);
    }
  },
  feedOffering: (data, formData, tags) => {
    if (data.offering) {
      data.offering = tagsMap(data.offering, "offering", tags);
    }
  },
  feedTitle: (data, formData, group) => {
    if (data.title?.[formData[group].titleAndLastName.title]) {
      data.title = formData[group].titleAndLastName.title;
    }
  },
};
