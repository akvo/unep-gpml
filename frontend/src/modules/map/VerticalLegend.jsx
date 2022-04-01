import React from "react";
import { Card, Typography } from "antd";
import { colorRange, higlightColor } from "./config";
import { topicNames, tTypes } from "../../utils/misc";
import { KNOWLEDGE_LIBRARY, STAKEHOLDER_OVERVIEW } from "./Map";
import { multicountryGroups } from "../knowledge-library/multicountry";

const { Text } = Typography;

const VerticalLegend = ({
  data,
  setFilterColor,
  selected,
  title,
  contents,
  path,
  query,
}) => {
  const entityQuery = query.networkType;
  const topicQuery = query.topic;

  const ResourceCountPerTransnationalGroup = multicountryGroups.map(
    (transnationalGroup) => {
      const countryIds = transnationalGroup.item
        .map((transnational) =>
          transnational.countries.map((country) => country.id)
        )
        .flat();

      const resources = contents
        .filter((content) => countryIds.includes(content.countryId))
        .map((content) => content.transnationalCounts);

      const totalTransantionalResourceCount = resources.reduce(
        (acc, currVal) => {
          acc = {
            ...acc,
            actionPlan: acc.actionPlan + currVal.actionPlan,
            event: acc.event + currVal.event,
            financingResource:
              acc.financingResource + currVal.financingResource,

            policy: acc.policy + currVal.policy,
            project:
              acc.project +
              currVal.project +
              ((acc.initiative || 0) + (currVal.initiative || 0)),
            technicalResource:
              acc.technicalResource + currVal.technicalResource,
            technology: acc.technology + currVal.technology,
            capacityBuilding:
              (acc.capacityBuilding || 0) + (currVal.capacityBuilding || 0),
          };
          return acc;
        },
        {
          actionPlan: 0,
          event: 0,
          financingResource: 0,
          project: 0,
          technicalResource: 0,
          technology: 0,
          policy: 0,
          capacityBuilding: 0,
        }
      );

      return {
        group: transnationalGroup.label,
        resourcePerCountry: totalTransantionalResourceCount,
      };
    }
  );

  const totalNationalResourceCount = contents.reduce(
    (acc, currVal) => {
      acc.nationalCount = {
        ...acc.nationalCount,
        actionPlan: acc.nationalCount.actionPlan + currVal.counts.actionPlan,
        event: acc.nationalCount.event + currVal.counts.event,
        financingResource:
          acc.nationalCount.financingResource +
          currVal.counts.financingResource,

        policy: acc.nationalCount.policy + currVal.counts.policy,
        project:
          acc.nationalCount.project +
          currVal.counts.project +
          ((acc.nationalCount.initiative || 0) +
            (currVal.counts.initiative || 0)),
        technicalResource:
          acc.nationalCount.technicalResource +
          currVal.counts.technicalResource,
        technology: acc.nationalCount.technology + currVal.counts.technology,
        capacityBuilding:
          (acc.nationalCount.capacityBuilding || 0) +
          (currVal.counts.capacityBuilding || 0),
      };
      return acc;
    },
    {
      nationalCount: {
        actionPlan: 0,
        event: 0,
        financingResource: 0,
        project: 0,
        technicalResource: 0,
        technology: 0,
        policy: 0,
        capacityBuilding: 0,
      },
    }
  ).nationalCount;

  const stakeholderTotalCounts = contents.reduce(
    (acc, currVal) => {
      acc = {
        ...acc,
        individual: acc.individual + currVal.counts.stakeholder,
        entity: {
          member: acc.entity.member + currVal.counts.organisation,
          nonMember:
            acc.entity.nonMember + currVal.transnationalCounts.organisation,
        },
      };
      return acc;
    },
    {
      individual: 0,
      entity: {
        member: 0,
        nonMember: 0,
      },
    }
  );

  const stakeholderPerTransnationalGroup = multicountryGroups.map(
    (transnationalGroup) => {
      const countryIds = transnationalGroup.item
        .map((transnational) =>
          transnational.countries.map((country) => country.id)
        )
        .flat();

      const resources = contents.filter((content) =>
        countryIds.includes(content.countryId)
      );

      const totalTransantionalStakeholderCount = resources.reduce(
        (acc, currVal) => {
          acc = {
            ...acc,
            individual: acc.individual + currVal.counts.stakeholder,
            entity: {
              member: acc.entity.member + currVal.counts.organisation,
              nonMember:
                acc.entity.nonMember + currVal.transnationalCounts.organisation,
            },
          };
          return acc;
        },
        {
          individual: 0,
          entity: {
            member: 0,
            nonMember: 0,
          },
        }
      );

      return {
        group: transnationalGroup.label,
        stakeholderPerCountry: totalTransantionalStakeholderCount,
      };
    }
  );

  const stakeholderCounts = () => {
    return entityQuery.length === 0 ? (
      <div>
        <div>
          <b className="legend-stakeholder-title">Type</b>

          <div className="legend-stakeholder-wrapper">
            <div className="legend-stakeholder-type">
              <div className="type">Entity</div>
              <div className="entities">
                <div className="entity-breakdown">
                  <b>Member of GPML</b>
                  <b>{stakeholderTotalCounts.entity.member}</b>
                </div>
                <div className="entity-breakdown">
                  <b>Non-member </b>
                  <b>
                    <b>{stakeholderTotalCounts.entity.nonMember}</b>
                  </b>
                </div>
              </div>
            </div>

            <div className="legend-stakeholder-type individual">
              <div className="type">Individual</div>
              <b>{stakeholderTotalCounts.individual}</b>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div>
        <div>
          <b className="legend-stakeholder-title">Type</b>
          <div className="legend-stakeholder-wrapper">
            {entityQuery.includes("organisation") && (
              <div className="legend-stakeholder-type">
                <div className="type">Entity</div>
                <div className="entities">
                  <div className="entity-breakdown">
                    <b>Member of GPML</b>
                    <b>{stakeholderTotalCounts.entity.member}</b>
                  </div>
                  <div className="entity-breakdown">
                    <b>Non-member </b>
                    <b>
                      <b>{stakeholderTotalCounts.entity.nonMember}</b>
                    </b>
                  </div>
                </div>
              </div>
            )}

            {entityQuery.includes("stakeholder") && (
              <div className="legend-stakeholder-type individual">
                <div className="type">Individual</div>
                <b>{stakeholderTotalCounts.individual}</b>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stakeholderCountsPerTransnationalGroup = () => {
    return stakeholderPerTransnationalGroup.map((transnationalGroup) => {
      return (
        <div key={transnationalGroup?.group}>
          <div className="legend-transnational-count">
            <strong className="legend-transnational-title">
              {transnationalGroup?.group}
            </strong>
            <div>
              {entityQuery.length === 0 ? (
                <div>
                  <b className="legend-stakeholder-title">Type</b>

                  <div className="legend-stakeholder-wrapper">
                    <div className="legend-stakeholder-type">
                      <div className="type">Entity</div>
                      <div className="entities">
                        <div className="entity-breakdown">
                          <b>Member of GPML</b>
                          <b>
                            {
                              transnationalGroup.stakeholderPerCountry.entity
                                .member
                            }
                          </b>
                        </div>
                        <div className="entity-breakdown">
                          <b>Non-member </b>
                          <b>
                            <b>
                              {
                                transnationalGroup.stakeholderPerCountry.entity
                                  .nonMember
                              }
                            </b>
                          </b>
                        </div>
                      </div>
                    </div>

                    <div className="legend-stakeholder-type individual">
                      <div className="type">Individual</div>
                      <b>
                        {transnationalGroup.stakeholderPerCountry.individual}
                      </b>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <b className="legend-stakeholder-title">Type</b>

                  {entityQuery.includes("organisation") && (
                    <div className="legend-stakeholder-type">
                      <div className="type">Entity</div>
                      <div className="entities">
                        <div className="entity-breakdown">
                          <b>Member of GPML</b>
                          <b>
                            {
                              transnationalGroup.stakeholderPerCountry.entity
                                .member
                            }
                          </b>
                        </div>
                        <div className="entity-breakdown">
                          <b>Non-member </b>
                          <b>
                            <b>
                              {
                                transnationalGroup.stakeholderPerCountry.entity
                                  .nonMember
                              }
                            </b>
                          </b>
                        </div>
                      </div>
                    </div>
                  )}

                  {entityQuery.includes("stakeholder") && (
                    <div className="legend-stakeholder-type individual">
                      <div className="type">Individual</div>
                      <b>
                        {transnationalGroup.stakeholderPerCountry.individual}
                      </b>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const transnationalResources = () => {
    return ResourceCountPerTransnationalGroup.map((transnationalGroup) => {
      return (
        <div key={transnationalGroup?.group}>
          <div className="legend-transnational-count">
            <strong className="legend-transnational-title">
              {transnationalGroup?.group}
            </strong>
            <div>
              {[...tTypes, "capacityBuilding"]
                .filter(
                  (topic) => topic !== "organisation" && topic !== "stakeholder"
                )
                .map((topic) => {
                  const topicChecker = () => {
                    if (topic === "actionPlan") {
                      return "action_plan";
                    } else if (topic === "technicalResource") {
                      return "technical_resource";
                    } else if (topic === "financingResource") {
                      return "financing_resource";
                    } else {
                      return topic;
                    }
                  };

                  return topicQuery.length === 0 ? (
                    <div key={topic} className="total-resources">
                      <div>{topicNames(topic)}</div>
                      <div>
                        <b>
                          {transnationalGroup.resourcePerCountry?.[topic]
                            ? transnationalGroup.resourcePerCountry?.[topic]
                            : 0}
                        </b>
                      </div>
                    </div>
                  ) : (
                    topicQuery.includes(topicChecker()) && (
                      <div key={topic} className="total-resources">
                        <div>{topicNames(topic)}</div>
                        <div>
                          <b>
                            {transnationalGroup.resourcePerCountry?.[topic]
                              ? transnationalGroup.resourcePerCountry?.[topic]
                              : 0}
                          </b>
                        </div>
                      </div>
                    )
                  );
                })}
            </div>
          </div>
        </div>
      );
    });
  };

  const totalResourcesContent = () =>
    [...tTypes, "capacityBuilding"]
      .filter((topic) => topic !== "organisation" && topic !== "stakeholder")
      .map((topic) => {
        const topicChecker = () => {
          if (topic === "actionPlan") {
            return "action_plan";
          } else if (topic === "technicalResource") {
            return "technical_resource";
          } else if (topic === "financingResource") {
            return "financing_resource";
          } else {
            return topic;
          }
        };

        return topicQuery.length === 0 ? (
          <div key={topic} className="total-resources">
            <div>{topicNames(topic)}</div>
            <div>
              <b>
                {totalNationalResourceCount?.[topic]
                  ? totalNationalResourceCount?.[topic]
                  : 0}
              </b>
            </div>
          </div>
        ) : (
          topicQuery.includes(topicChecker()) && (
            <div key={topic} className="total-resources">
              <div>{topicNames(topic)}</div>
              <div>
                <b>
                  {totalNationalResourceCount?.[topic]
                    ? totalNationalResourceCount?.[topic]
                    : 0}
                </b>
              </div>
            </div>
          )
        );
      });

  data = Array.from(new Set(data.map((x) => Math.floor(x))));
  data = data.filter((x) => x !== 0);
  const range = data.map((x, i) => (
    <div
      key={`legend-${i + 1}`}
      className={
        "legend" +
        (selected !== null && selected === colorRange[i]
          ? " legend-selected"
          : "")
      }
      onClick={(e) => {
        selected === null
          ? setFilterColor(colorRange[i])
          : selected === colorRange[i]
          ? setFilterColor(null)
          : setFilterColor(colorRange[i]);
      }}
      style={{
        background: colorRange[i] === selected ? higlightColor : "transparent",
      }}
    />
  ));

  if (data.length) {
    return (
      <Card className="card-legend-wrapper" style={{ width: 300 }}>
        <div>
          <div className="title">{title && <Text strong>{title}</Text>}</div>
          <div
            style={{
              background: `linear-gradient(180deg, rgba(103,190,161,1) 10%, rgba(255,255,255,1) 90%)`,
              width: 20,
              // minHeight: 132,
              float: "left",
            }}
          >
            {[
              ...range,
              <div
                key={"legend-0"}
                className={
                  "legend" +
                  (selected !== null && selected === colorRange[range.length]
                    ? " legend-selected"
                    : "")
                }
                style={{
                  backgroundColor:
                    colorRange[range.length] === selected
                      ? higlightColor
                      : "transparent",
                }}
                onClick={(e) => {
                  selected === null
                    ? setFilterColor(colorRange[range.length])
                    : selected === colorRange[range.length]
                    ? setFilterColor(null)
                    : setFilterColor(colorRange[range.length]);
                }}
              />,
              <div
                key={"legend-last"}
                className={
                  "legend" +
                  (selected !== null && selected === "#fff"
                    ? " legend-selected"
                    : "")
                }
                style={{
                  backgroundColor:
                    "#fff" === selected ? higlightColor : "transparent",
                }}
                onClick={(e) => {
                  selected === null
                    ? setFilterColor("#fff")
                    : selected === "#fff"
                    ? setFilterColor(null)
                    : setFilterColor("#fff");
                }}
              />,
            ]}
          </div>
          <div style={{ float: "left" }}>
            {data.map((x, i) => (
              <div key={i} className="legend label">
                <Text>{data[i - 1] ? `${x} - ${data[i - 1]}` : `> ${x}`}</Text>
              </div>
            ))}
            <div className="legend label">
              <Text>{`1 - ${data[data.length - 1]}`}</Text>
            </div>
            <div className="legend label">
              <Text>0</Text>
            </div>
          </div>
        </div>
        <hr className="legend-separator" />
        {path === KNOWLEDGE_LIBRARY && (
          <>
            <div className="total-resources-wrapper">
              <strong className="legend-heading">Total resources</strong>
              {totalResourcesContent()}
            </div>

            <hr className="legend-separator" />

            <div className="total-resources-wrapper">
              <strong className="legend-heading">
                Total resources per transnational group
              </strong>
              {transnationalResources()}
            </div>
          </>
        )}
        {path === STAKEHOLDER_OVERVIEW && (
          <>
            <div className="total-resources-wrapper">
              <strong className="legend-heading">Total stakeholders</strong>
              {stakeholderCounts()}
            </div>

            <hr className="legend-separator" />
            <div className="total-resources-wrapper">
              <strong className="legend-heading">
                Total stakeholders per transnational group
              </strong>
              {stakeholderCountsPerTransnationalGroup()}
            </div>
          </>
        )}
      </Card>
    );
  }
  return <div className="no-legend-warning">No legend</div>;
};

export default VerticalLegend;
