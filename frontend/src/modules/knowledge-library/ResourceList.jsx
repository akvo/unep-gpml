import React from "react";
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
import {
  UserOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";

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

import HideIcon from "../../images/knowledge-library/hide-icon.svg";
import SortIcon from "../../images/knowledge-library/sort-icon.svg";

const ResourceList = ({
  filters,
  setListVisible,
  countData,
  updateQuery,
  loading,
  results = [],
  pageSize,
  hideListButtonVisible,
}) => {
  const { profile, countries, tags, transnationalOptions } = UIStore.useState(
    (s) => ({
      profile: s.profile,
      countries: s.countries,
      tags: s.tags,
      transnationalOptions: s.transnationalOptions,
    })
  );
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
      : topicsForTotal;
  const totalItems = filteredTopics.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  return (
    <Row>
      <Col span={24}>
        <PageHeader
          className="resource-list-header"
          ghost={false}
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
          subTitle={
            <span className="result-number">
              Showing{" "}
              {totalItems > pageSize + filters?.offset
                ? pageSize + filters?.offset
                : totalItems}{" "}
              of {totalItems || 0} result{totalItems > 1 ? "s" : ""}
            </span>
          }
          extra={
            <Button className="sort-btn">
              <img src={SortIcon} alt="sort-icon" />{" "}
              <span>
                Sort By:
                <br /> <b>A&gt;Z</b>
              </span>
            </Button>
          }
        />
      </Col>
      <Col span={24} className="resource-list">
        {!isLoaded() || loading ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading
          </h2>
        ) : isLoaded() && !loading && !isEmpty(results) ? (
          <ResourceItem results={results} />
        ) : (
          <h2 className="loading">There is no data to display</h2>
        )}
        <div className="page">
          {!isEmpty(results) && (
            <Pagination
              defaultCurrent={1}
              current={(filters?.offset || 0) / pageSize + 1}
              pageSize={pageSize}
              total={totalItems}
              showSizeChanger={false}
              onChange={(n, size) => updateQuery("offset", (n - 1) * size)}
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

const ResourceItem = ({ results }) => {
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

    return (
      <Card key={`${type}-${id}`} className="resource-item">
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
              maxCount={3}
              maxStyle={{
                color: "#f56a00",
                backgroundColor: "#fde3cf",
              }}
            >
              {["a", "b"].map((b, i) => (
                <Tooltip key={`avatar-${i}`} title={b} placement="top">
                  <Avatar
                    style={{ backgroundColor: "#FFB800" }}
                    icon={<UserOutlined />}
                  />
                </Tooltip>
              ))}
            </Avatar.Group>{" "}
            <span className="avatar-number">+42</span>
          </Space>
          <span className="read-more">
            <Link to={linkTo}>
              Read more <ArrowRightOutlined />
            </Link>
          </span>
        </div>
      </Card>
    );
  });
};

export default ResourceList;
