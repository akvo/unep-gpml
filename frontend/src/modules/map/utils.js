const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);

const snakeToCamel = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

export const curr = (topics, findData, path) => {
  const properties = topics.map(snakeToCamel);

  const propsToSum = properties.reduce((acc, curr, index) => {
    const currProp = properties[index];

    acc[currProp] = findData?.[currProp];
    return acc;
  }, {});

  if (properties.length) {
    return sumValues(propsToSum);
  } else {
    if (path === "/knowledge-library") {
      return sumValues({
        actionPlan: findData?.actionPlan,
        event: findData?.event,
        financingResource: findData?.financingResource,
        policy: findData?.policy,
        project: findData?.project,
        technicalResource: findData?.technicalResource,
        technology: findData?.technology,
      });
    }
    if (path === "/stakeholder-overview") {
      return sumValues({
        stakeholder: findData?.stakeholder,
        organisation: findData?.organisation,
      });
    }
  }
};
