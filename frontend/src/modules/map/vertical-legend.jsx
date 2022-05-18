import React from "react";
import { Card, Typography } from "antd";
import { colorRange, higlightColor } from "./config";
import { topicNames, tTypes } from "../../utils/misc";
import { KNOWLEDGE_LIBRARY, STAKEHOLDER_OVERVIEW } from "./map";
import { multicountryGroups } from "../knowledge-library/multicountry";
import PieChart from "../chart/pie-chart";

const { Text } = Typography;

const VerticalLegend = ({
  data,
  setFilterColor,
  selected,
  title,
  contents,
  path,
  countData,
  stakeholderCount,
  existingData,
  countryGroupCounts,
}) => {
  // TOTAL RESOURCES COUNTS
  const ResourcesCountPerTransnationalGroups = multicountryGroups.map(
    (transnationalGroup) => {
      const countryIds = transnationalGroup.item
        .map((transnational) =>
          transnational.countries.map((country) => country.id)
        )
        .flat();

      const transnationalResources = transnationalGroup.item.map(
        (transantional) => {
          const countryIdsPerTransnational = transantional.countries.map(
            (country) => country.id
          );

          const resourcesPerTransnational = contents
            .filter((content) =>
              countryIdsPerTransnational.includes(content.countryId)
            )
            .map((content) => content.transnationalCounts);

          const result = resourcesPerTransnational.reduce(
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
              id: 0,
            }
          );

          return {
            label: transantional.name,
            id: transantional.id,
            totalResources: result,
          };
        }
      );

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
        groupLabel: transnationalGroup.label,
        resourcePerCountry: totalTransantionalResourceCount,
        transnational: transnationalResources,
      };
    }
  );

  const totalResourceCount =
    path === KNOWLEDGE_LIBRARY &&
    countData.filter(
      (data) =>
        data.topic !== "stakeholder" &&
        data.topic !== "organisation" &&
        data.topic !== "gpml_member_entities" &&
        data.topic !== "non_member_organisation"
    );

  const resourcesPerTransnationalList = ResourcesCountPerTransnationalGroups.map(
    (item) => item.transnational
  ).flat();

  const transnationalResourcesContent = () =>
    resourcesPerTransnationalList
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((transnational) => {
        const data = countryGroupCounts.find(
          (item) => item?.countryGroupId === transnational?.id
        );

        return (
          <div key={transnational.label} className="legend-transnational-count">
            <strong className="legend-transnational-title">
              {transnational?.label}
            </strong>
            <div>
              {tTypes
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

                  return existingData.length === 0 ? (
                    <div key={topic} className="total-resources">
                      <div>{topicNames(topic)}</div>
                      <div>
                        <b>{data?.counts?.[topic] || 0}</b>
                      </div>
                    </div>
                  ) : (
                    existingData.includes(topicChecker()) && (
                      <div key={topic} className="total-resources">
                        <div>{topicNames(topic)}</div>
                        <div>
                          <b>{data?.counts?.[topic] || 0}</b>
                        </div>
                      </div>
                    )
                  );
                })}
            </div>
          </div>
        );
      });

  // TOTAL RESOURCES
  const resourceCounts =
    path === KNOWLEDGE_LIBRARY &&
    totalResourceCount.map((resource) => resource?.count);

  const totalResources =
    path === KNOWLEDGE_LIBRARY &&
    resourceCounts.reduce((acc, val) => acc + val, 0);

  const totalResourcesContent = () =>
    tTypes
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
        const findTopic = totalResourceCount.find(
          (data) => data.topic === topicChecker()
        );

        return existingData.length === 0 ? (
          <div key={topic} className="total-resources">
            <div>{topicNames(topic)}</div>
            <b>{findTopic?.count ? findTopic?.count : 0}</b>
          </div>
        ) : (
          existingData.includes(topicChecker()) && (
            <div key={topic} className="total-resources">
              <div>{topicNames(topic)}</div>

              <b>{findTopic?.count ? findTopic?.count : 0}</b>
            </div>
          )
        );
      });

  // STAKEHOLDER TOTAL COUNTS
  const stakeholderTotalCounts = path === STAKEHOLDER_OVERVIEW && {
    individual: stakeholderCount.individual,
    entity: stakeholderCount.entity,
  };

  const stakeholderPerTransnationalGroup = multicountryGroups
    .filter(
      (item) =>
        item.label.toLowerCase() === "un regional groups of member states"
    )
    .map((transnationalGroup) => {
      const countryIds = transnationalGroup.item
        .map((transnational) =>
          transnational.countries.map((country) => country.id)
        )
        .flat();

      const stakeholders = contents
        .filter((content) => countryIds.includes(content.countryId))
        .map((content) => content.transnationalCounts);

      const transnationalStakeholders = transnationalGroup.item.map(
        (transantional) => {
          const countryIdsPerTransnational = transantional.countries.map(
            (country) => country.id
          );

          const stakeholdersPerTransnational = contents
            .filter((content) =>
              countryIdsPerTransnational.includes(content.countryId)
            )
            .map((content) => content.transnationalCounts);

          const result = stakeholdersPerTransnational.reduce(
            (acc, currVal) => {
              acc = {
                ...acc,
                individual: acc.individual + Number(currVal.stakeholder) || 0,
                entity: {
                  member: acc.entity.member + Number(currVal.organisation),
                  nonMember:
                    acc.entity.nonMember +
                    Number(currVal.nonMemberOrganisation),
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
            label: transantional.name,
            id: transantional.id,
            totalStakeholders: result,
          };
        }
      );

      const totalTransnationalStakeholderCount = stakeholders.reduce(
        (acc, currVal) => {
          acc = {
            ...acc,
            individual: acc.individual + Number(currVal.stakeholder),
            entity: {
              member: acc.entity.member + Number(currVal.organisation),
              nonMember:
                acc.entity.nonMember + Number(currVal.nonMemberOrganisation),
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
        groupLabel: transnationalGroup.label,
        stakeholderPerCountry: totalTransnationalStakeholderCount,
        transnational: transnationalStakeholders,
      };
    });

  const stakeholderCountsContent = () => {
    return existingData.length === 0 ? (
      <div>
        <div>
          <b className="legend-stakeholder-title">Type</b>

          <div className="legend-stakeholder-wrapper">
            <div className="legend-stakeholder-type">
              <div className="type">Entity</div>
              <div className="entities">
                <div className="entity-breakdown">
                  <b>
                    <b>{stakeholderTotalCounts.entity}</b>
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
            {existingData.includes("organisation") && (
              <div className="legend-stakeholder-type">
                <div className="type">Entity</div>
                <div className="entities">
                  <div className="entity-breakdown">
                    <b>{stakeholderTotalCounts.entity}</b>
                  </div>
                </div>
              </div>
            )}

            {existingData.includes("stakeholder") && (
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

  const stakeholderPerTransnationalList = stakeholderPerTransnationalGroup
    .map((item) => item.transnational)
    .flat();

  const entityPerTransnationalGroupContent = () => {
    return stakeholderPerTransnationalList
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((transnational) => {
        const data = countryGroupCounts.find(
          (item) => item?.countryGroupId === transnational?.id
        );

        return existingData.length === 0 ? (
          <div key={transnational.label} className="legend-transnational-count">
            <strong className="legend-transnational-title">
              {transnational.label}
            </strong>
            <div>
              <div>
                <b className="legend-stakeholder-title">Type</b>

                <div className="legend-stakeholder-wrapper">
                  <div className="legend-stakeholder-type">
                    <div className="type">Entity</div>
                    <div className="entities">
                      <b className="entity-breakdown">
                        {(data?.counts?.organisation || 0) +
                          (data?.counts?.nonMemberOrganisation || 0)}
                      </b>
                    </div>
                  </div>

                  <div className="legend-stakeholder-type individual">
                    <div className="type">Individual</div>
                    <b>{data?.counts?.individual || 0}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div key={transnational.label} className="legend-transnational-count">
            <strong className="legend-transnational-title">
              {transnational.label}
            </strong>
            <div>
              <div>
                <b className="legend-stakeholder-title">Type</b>

                <div className="legend-stakeholder-wrapper">
                  {existingData.includes("organisation") && (
                    <div className="legend-stakeholder-type">
                      <div className="type">Entity</div>
                      <div className="entities">
                        <b className="entity-breakdown">
                          {(data?.counts?.organisation || 0) +
                            (data?.counts?.nonMemberOrganisation || 0)}
                        </b>
                      </div>
                    </div>
                  )}
                  {existingData.includes("stakeholder") && (
                    <div className="legend-stakeholder-type individual">
                      <div className="type">Individual</div>
                      <b>{data?.counts?.individual || 0}</b>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      });
  };

  const entityPerTransnationalContent = () => {
    return (
      <>
        <hr className="legend-separator" />
        <div className="total-resources-wrapper">
          <strong className="legend-heading">
            Total stakeholders per transnational
          </strong>
          {entityPerTransnationalGroupContent()}
        </div>
      </>
    );
  };

  // Percentage of the stakeholder on each UN regional groups of member states
  const stakeholderPerUNGroup = stakeholderPerTransnationalGroup
    .map((item) => item.transnational)
    .flat();

  const transnationalStakeholders =
    path === STAKEHOLDER_OVERVIEW &&
    stakeholderPerUNGroup
      .map((transnational) => {
        const data = countryGroupCounts.find(
          (item) => item?.countryGroupId === transnational?.id
        );

        return {
          id: transnational.label,
          name: transnational.label,
          title: transnational.label,
          count:
            (data?.counts?.stakeholder || 0) +
              (data?.counts?.organisation || 0) +
              (data?.counts?.nonMemberOrganisation || 0) || 0,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));

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
      <Card className="card-legend-wrapper">
        <div className="legend-content-wrapper">
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
              <div className="total-resources total-count">
                <strong>Total</strong> <b>{totalResources}</b>
              </div>
              {totalResourcesContent()}
            </div>

            <hr className="legend-separator" />

            <div className="total-resources-wrapper">
              <strong className="legend-heading">
                Total resources per transnational
              </strong>
              {transnationalResourcesContent()}
            </div>
          </>
        )}
        {path === STAKEHOLDER_OVERVIEW && (
          <>
            <div className="total-resources-wrapper">
              <strong className="legend-heading">Total stakeholders</strong>
              <div className="total-resources total-count">
                <strong>Total</strong>{" "}
                <b>
                  {(stakeholderTotalCounts?.entity || 0) +
                    (stakeholderTotalCounts?.individual || 0)}
                </b>
              </div>
              {stakeholderCountsContent()}
            </div>
            {existingData.includes("organisation") && (
              <>
                <strong className="legend-heading pie-chart-header">
                  Entities from UN Regional Groups of member States
                </strong>
                <PieChart data={transnationalStakeholders} />
              </>
            )}

            {existingData.includes("organisation")
              ? entityPerTransnationalContent()
              : existingData.length === 0 && entityPerTransnationalContent()}
          </>
        )}
      </Card>
    );
  }
  return <div className="no-legend-warning">No legend</div>;
};

export default VerticalLegend;
