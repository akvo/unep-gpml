const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);

export const snakeToCamel = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

export const curr = (findData, path, existingData) => {
  const properties = existingData.map(snakeToCamel);

  const propsToSum = properties.reduce((acc, curr, index) => {
    const currProp = properties[index];

    acc[currProp] = findData?.[currProp];

    if (currProp === "project") {
      return { ...acc, initiative: findData?.["initiative"] || 0 };
    } else {
      return acc;
    }
  }, {});
  if (existingData.length !== 0) {
    if (properties.length) {
      return sumValues(propsToSum);
    } else {
      if (path === "/knowledge/library") {
        return sumValues({
          actionPlan: findData?.actionPlan,
          event: findData?.event,
          financingResource: findData?.financingResource,
          policy: findData?.policy,
          project: findData?.project,
          technicalResource: findData?.technicalResource,
          technology: findData?.technology,
          initiative: findData?.initiative || 0,
        });
      }
      if (path === "/connect/community") {
        return sumValues({
          stakeholder: findData?.stakeholder,
          organisation: findData?.organisation,
        });
      }
    }
  }
};
