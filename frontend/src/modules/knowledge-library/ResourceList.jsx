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
import { NavLink, Link } from "react-router-dom";

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
import SortIcon from "../../images/knowledge-library/sort-icon.svg";

const ResourceList = ({
  view,
  results = [],
  countData,
  filters,
  loading,
  pageSize,
  hideListButtonVisible,
  updateQuery,
  setListVisible,
}) => {
  const {
    profile,
    countries,
    tags,
    transnationalOptions,
    stakeholders,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    countries: s.countries,
    tags: s.tags,
    transnationalOptions: s.transnationalOptions,
    stakeholders: s.stakeholders,
  }));

  const [allResults, setAllResults] = useState([]);
  const [isAscending, setIsAscending] = useState(null);

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

  const sortResults = () => {
    if (!isAscending) {
      const sortAscending = allResults.sort((result1, result2) => {
        if (result1?.title) {
          return result1.title.localeCompare(result2.title, "en", {
            numeric: true,
          });
        } else {
          return result1?.name?.localeCompare(result2?.name, "en", {
            numeric: true,
          });
        }
      });
      setAllResults(sortAscending);
    } else {
      const sortDescending = allResults.sort((result1, result2) => {
        if (result2?.title) {
          return result2.title.localeCompare(result1.title, "en", {
            numeric: true,
          });
        } else {
          return result2?.name?.localeCompare(result1?.name, "en", {
            numeric: true,
          });
        }
      });
      setAllResults(sortDescending);
    }
    setIsAscending(!isAscending);
  };

  useEffect(() => {
    setAllResults(
      [...results].sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
    );
  }, [results]);

  return (
    <Row>
      <Col span={24}>
        <PageHeader
          className="resource-list-header"
          ghost={false}
          style={
            view === "map"
              ? { backgroundColor: "rgba(255, 255, 255, 0.3)" }
              : { backgroundColor: "rgba(255, 255, 255, 1)" }
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
            ) : (
              ""
            )
          }
          const
          subTitle={
            <span className="result-number">
              Showing{" "}
              {totalItems > pageSize + filters?.offset
                ? pageSize + Number(filters?.offset)
                : itemCount}{" "}
              of {totalItems || 0} result{totalItems > 1 ? "s" : ""}
            </span>
          }
          extra={
            <Button className="sort-btn" onClick={sortResults}>
              <img src={SortIcon} alt="sort-icon" />{" "}
              <span>
                Sort By:
                <br />{" "}
                {isAscending || isAscending === null ? (
                  <b>A&gt;Z</b>
                ) : (
                  <b>Z&gt;A</b>
                )}
              </span>
            </Button>
          }
        />
      </Col>
      <div>
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
        <div className="page">
          {!isEmpty(allResults) && (
            <Pagination
              defaultCurrent={1}
              current={(filters?.offset || 0) / pageSize + 1}
              pageSize={pageSize}
              total={totalItems}
              showSizeChanger={false}
              onChange={(n, size) => updateQuery("offset", (n - 1) * size)}
            />
          )}
          <div className="result-number">
            {totalItems > pageSize + filters?.offset
              ? pageSize + Number(filters?.offset)
              : itemCount}{" "}
            of {totalItems || 0} result{totalItems > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </Row>
  );
};

const ResourceItem = ({ results, view, stakeholders }) => {
  return results.map((result) => {
    const { id, type } = result;
    const fullName = (data) =>
      data.title
        ? `${data.title} ${data.firstName} ${data.lastName}`
        : `${data.firstName} ${data.lastName}`;
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
    const stakeholdersConnectionList = result?.stakeholderConnections;
    const stakeholderCount = result?.stakeholderConnections?.length;

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
            <div className="title">{title}</div>
            <div className="description">
              <TrimText text={description} max={125} />
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
                    const findStakeholder = stakeholders.stakeholders.find(
                      (pers) => pers.id === stakeholder?.stakeholderId
                    );

                    return (
                      <Tooltip
                        key={stakeholder?.id}
                        title={`${findStakeholder?.firstName} ${findStakeholder?.lastName}`}
                        placement="top"
                      >
                        <NavLink
                          to={`/stakeholder/${findStakeholder?.id}`}
                          className="stakeholder-connection-avatar"
                        >
                          <Avatar
                            style={{ backgroundColor: "#FFB800" }}
                            icon={<img src={stakeholder?.image} />}
                          />
                        </NavLink>
                      </Tooltip>
                    );
                  })}
              </Avatar.Group>
            </Space>
            <span className="avatar-number">
              {result.stakeholderConnections.length !== 0 &&
                result.stakeholderConnections !== null &&
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
