const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);

export const curr = (topic, findData, path) => {
  let property = [];
  for (let i = 0; topic?.length > i; i++) {
    property.push(topic[i]);
  }

  property = property.map((text) => {
    if (text === "action_plan") {
      return "actionPlan";
    } else if (text === "financing_resource") {
      return "financingResource";
    } else if (text === "technology") {
      return "technology";
    } else if (text === "technical_resource") {
      return "technicalResource";
    } else {
      return text;
    }
  });

  if (topic?.length === 1) {
    return sumValues({ [property[0]]: findData?.[property[0]] });
  } else if (topic?.length === 2) {
    return sumValues({
      [property[0]]: findData?.[property[0]],
      [property[1]]: findData?.[property[1]],
    });
  } else if (topic?.length === 3) {
    return sumValues({
      [property[0]]: findData?.[property[0]],
      [property[1]]: findData?.[property[1]],
      [property[2]]: findData?.[property[2]],
    });
  } else if (topic?.length === 4) {
    return sumValues({
      [property[0]]: findData?.[property[0]],
      [property[1]]: findData?.[property[1]],
      [property[2]]: findData?.[property[2]],
      [property[3]]: findData?.[property[3]],
    });
  } else if (topic?.length === 5) {
    return sumValues({
      [property[0]]: findData?.[property[0]],
      [property[1]]: findData?.[property[1]],
      [property[2]]: findData?.[property[2]],
      [property[3]]: findData?.[property[3]],
      [property[4]]: findData?.[property[4]],
    });
  } else if (topic?.length === 6) {
    return sumValues({
      [property[0]]: findData?.[property[0]],
      [property[1]]: findData?.[property[1]],
      [property[2]]: findData?.[property[2]],
      [property[3]]: findData?.[property[3]],
      [property[4]]: findData?.[property[4]],
      [property[5]]: findData?.[property[5]],
    });
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
