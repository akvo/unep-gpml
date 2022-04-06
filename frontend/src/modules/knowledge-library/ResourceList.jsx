import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  PageHeader,
  Card,
  Space,
  Avatar,
  Button,
  Tooltip,
  Pagination,
} from "antd";
import { ArrowRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import "./styles.scss";
import { UIStore } from "../../store";
import {
  topicTypes,
  topicTypesApprovedUser,
  topicNames,
} from "../../utils/misc";
import humps from "humps";
import { TrimText } from "../../utils/string";
import isEmpty from "lodash/isEmpty";

// Icons
import HideIcon from "../../images/knowledge-library/hide-icon.svg";

const ResourceList = ({
  view,
  results = [],
  allResults,
  countData,
  filters,
  loading,
  pageSize,
  updateQuery,
  hideListButtonVisible,
  setListVisible,
}) => {
  const {
    tags,
    profile,
    countries,
    transnationalOptions,
    stakeholders,
  } = UIStore.useState((s) => ({
    tags: s.tags,
    profile: s.profile,
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    stakeholders: s.stakeholders,
  }));

  const [isAscending, setIsAscending] = useState(null);
  const [didMount, setDidMount] = useState(false);

  const isApprovedUser = profile?.reviewStatus === "APPROVED";

  const isLoaded = () =>
    Boolean(
      !isEmpty(countries) && !isEmpty(tags) && !isEmpty(transnationalOptions)
    );

  // Choose topics to count, based on whether user is approved or not,
  // and if any topic filters are active.
  const topicsForTotal = (isApprovedUser
    ? topicTypesApprovedUser
    : topicTypes
  ).map((t) => humps.decamelize(t));
  const filteredTopics =
    filters?.topic?.length > 0
      ? filters?.topic?.filter((t) => topicsForTotal.indexOf(t) > -1)
      : topicsForTotal.filter(
          (t) => t !== "organisation" && t !== "stakeholder"
        );
  const totalItems = filteredTopics.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  const itemCount = loading
    ? 0
    : filters?.offset !== undefined
    ? totalItems
    : pageSize;

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  return (
    <Row style={{ postion: "relative" }}>
      {/* <Col span={24}>
        <PageHeader
          className="resource-list-header"
          ghost={false}
          style={
            view === "map"
              ? { backgroundColor: "rgba(255, 255, 255, 0.3)" }
              : {
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  minHeight: "72px",
                }
          }
          onBack={() => setListVisible(false)}
          backIcon={
            hideListButtonVisible ? (
              <img src={HideIcon} className="hide-icon hide" alt="hide-icon" />
            ) : (
              ""
            )
          }
          title={
            hideListButtonVisible ? (
              <span className="hide-text">Hide List</span>
            ) : view === "topic" ? (
              <div style={{ minHeight: "32px", display: "block" }} />
            ) : (
              ""
            )
          }
          const
          subTitle={
            !loading ? (
              <span className="result-number">
                Showing{" "}
                {totalItems > pageSize + filters?.offset
                  ? pageSize + Number(filters?.offset)
                  : itemCount}{" "}
                of {totalItems || 0} result
                {totalItems > 1 ? "s" : ""}
              </span>
            ) : (
              <div className="invisible-content" />
            )
          }
        />
      </Col> */}
      <Col
        span={24}
        className="resource-list"
        style={
          isLoaded() &&
          !loading &&
          !isEmpty(allResults) && { overflowY: "auto" }
        }
      >
        {!isLoaded() || loading ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading
          </h2>
        ) : isLoaded() && !loading && !isEmpty(allResults) ? (
          <ResourceItem
            view={view}
            results={allResults}
            stakeholders={stakeholders}
          />
        ) : (
          <h2 className="loading">There is no data to display</h2>
        )}
      </Col>
      {!isEmpty(allResults) && (
        <div className="page">
          <Pagination
            defaultCurrent={1}
            current={(filters?.offset || 0) / pageSize + 1}
            pageSize={pageSize}
            total={totalItems}
            showSizeChanger={false}
            onChange={(n, size) => updateQuery("offset", (n - 1) * size)}
          />

          <div className="result-number" style={{ opacity: loading && "0" }}>
            {totalItems > pageSize + filters?.offset
              ? pageSize + Number(filters?.offset)
              : itemCount}{" "}
            of {totalItems || 0} result{totalItems > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </Row>
  );
};

const ResourceItem = ({ results, view, stakeholders }) => {
  return results.map((result) => {
    const { id, type } = result;
    const fullName = (data) =>
      data?.title
        ? `${data?.title} ${data?.firstName} ${data?.lastName}`
        : `${data?.firstName} ${data?.lastName}`;
    const title =
      (type === "stakeholder" && fullName(result)) ||
      result.title ||
      result.name;
    const description =
      result.description ||
      result.abstract ||
      result.summary ||
      result.about ||
      result.remarks ||
      "";
    const linkTo = `/${type}/${id}`;
    const stakeholdersConnectionList = result?.stakeholderConnections.filter(
      (x) => x.stakeholderRole !== "ADMIN" || x.role === "interested in"
    );
    const stakeholderCount = result?.stakeholderConnections.filter(
      (x) => x.stakeholderRole !== "ADMIN" || x.role === "interested in"
    )?.length;

    const getStakeholderCount = () => {
      if (stakeholderCount > 3) {
        return `${stakeholderCount - 3}+`;
      } else {
        return;
      }
    };

    const stakeholderToDisplay = () => {
      if (stakeholderCount > 3) {
        return [
          stakeholdersConnectionList[0],
          stakeholdersConnectionList[1],
          stakeholdersConnectionList[2],
        ];
      } else {
        return stakeholdersConnectionList;
      }
    };

    return (
      <Link className="resource-item-wrapper" key={`${type}-${id}`} to={linkTo}>
        <Card
          className="resource-item"
          style={
            view === "map"
              ? { backgroundColor: "rgba(255, 255, 255, 0.3)" }
              : { backgroundColor: "rgba(255, 255, 255, 1)" }
          }
        >
          <div className="topic">{topicNames(type)}</div>
          <div className="item-body">
            <div className="title">
              <TrimText text={title} max={45} />
            </div>
            <div className="description">
              <TrimText text={description} max={45} />
            </div>
          </div>
          <div className="item-footer">
            <Space size={5}>
              <Avatar.Group
                className="avatar-group"
                maxCount={3}
                maxStyle={{
                  color: "#f56a00",
                  backgroundColor: "#fde3cf",
                }}
              >
                {result?.stakeholderConnections &&
                  stakeholderToDisplay().map((stakeholder) => {
                    const findStakeholder = stakeholders?.stakeholders?.find(
                      (pers) => pers.id === stakeholder?.stakeholderId
                    );

                    return (
                      <Tooltip
                        key={stakeholder?.id}
                        title={`${findStakeholder?.firstName} ${findStakeholder?.lastName}`}
                        placement="top"
                      >
                        <object className="stakeholder-connection-avatar">
                          <Link to={linkTo}>
                            <Avatar
                              style={{ backgroundColor: "#FFB800" }}
                              icon={<img src={stakeholder?.image} />}
                            />
                          </Link>
                        </object>
                      </Tooltip>
                    );
                  })}
              </Avatar.Group>
            </Space>
            <span className="avatar-number">
              {result?.stakeholderConnections?.length !== 0 &&
                result?.stakeholderConnections !== null &&
                getStakeholderCount()}
            </span>
            <span className="read-more">
              Read more
              <ArrowRightOutlined />
            </span>
          </div>
        </Card>
      </Link>
    );
  });
};

export default ResourceList;
