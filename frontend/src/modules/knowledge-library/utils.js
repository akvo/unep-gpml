const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);

export const curr = (topic, findData) => {
  let property = [];
  for (let i = 0; topic?.length > i; i++) {
    property.push(topic[i]);
  }

  property = property.map((text) => {
    if (text === "project") {
      return "project";
    }
    if (text === "event") {
      return "event";
    }
    if (text === "policy") {
      return "policy";
    }
    if (text === "action_plan") {
      return "actionPlan";
    }
    if (text === "financing_resource") {
      return "financingResource";
    }
    if (text === "technology") {
      return "technology";
    }
    if (text === "technical_resource") {
      return "technicalResource";
    }
  });

  if (topic?.length === 1) {
    if (topic?.length === 1) {
      if (topic.includes("project")) {
        return sumValues({ project: findData?.project });
      }
      if (topic.includes("event")) {
        return sumValues({ event: findData?.event });
      }
      if (topic.includes("policy")) {
        return sumValues({ policy: findData?.policy });
      }
      if (topic.includes("action_plan")) {
        return sumValues({ actionPlan: findData?.actionPlan });
      }
      if (topic.includes("financing_resource")) {
        return sumValues({ financingResource: findData?.financingResource });
      }
      if (topic.includes("technology")) {
        return sumValues({ technology: findData?.technology });
      }
      if (topic.includes("technical_resource")) {
        return sumValues({ technicalResource: findData?.technicalResource });
      }
    }
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
};
