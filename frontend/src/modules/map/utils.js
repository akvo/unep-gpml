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
      return { ...acc, initiative: findData?.["project"] || 0 };
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
          actionPlan: findData?.actionPlan || 0,
          event: findData?.event || 0,
          financingResource: findData?.financingResource || 0,
          policy: findData?.policy || 0,
          project: findData?.project || 0,
          technicalResource: findData?.technicalResource || 0,
          technology: findData?.technology || 0,
          initiative: findData?.initiative || 0,
        });
      }
      if (path === "/connect/community") {
        return sumValues({
          stakeholder: findData?.stakeholder || 0,
          organisation: findData?.organisation || 0,
        });
      }
      if (path === "/connect/experts") {
        return sumValues({
          experts: findData?.experts || 0,
        });
      }
    }
  }
};
