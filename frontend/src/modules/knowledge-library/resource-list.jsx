import React, { useEffect, useState } from "react";
import { Row, Col, Card, Space, Avatar, Tooltip, Pagination } from "antd";
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
import { useHistory } from "react-router-dom";
import { ReactComponent as SortIcon } from "../../images/knowledge-library/sort-icon.svg";
import DetailModal from "../details-page/modal";

// Icons

const ResourceList = ({
  view,
  query,
  allResults,
  countData,
  loading,
  pageSize,
  updateQuery,
  isAscending,
  sortResults,
}) => {
  const { profile, stakeholders } = UIStore.useState((s) => ({
    profile: s.profile,
    stakeholders: s.stakeholders,
  }));
  const history = useHistory();
  const [didMount, setDidMount] = useState(false);
  const [isShownModal, setIsShownModal] = useState(false);
  const [dataProperties, setDataProperties] = useState({
    resourceType: null,
    resourceId: null,
  });
  const [data, setData] = useState(null);
  const isApprovedUser = profile?.reviewStatus === "APPROVED";
  const [params, setParams] = useState(null);
  const topics = query?.topic;
  const [isShowModal, setIsShowModal] = useState(false);
  // Choose topics to count, based on whether user is approved or not,
  // and if any topic filters are active.
  const topicsForTotal = (isApprovedUser
    ? topicTypesApprovedUser
    : topicTypes
  ).map((t) => humps.decamelize(t));
  console.log("match::::::", params);
  const filteredTopics =
    topics?.length > 0
      ? topics?.filter((t) => topicsForTotal.indexOf(t) > -1)
      : topicsForTotal.filter(
          (t) =>
            t !== "organisation" &&
            t !== "stakeholder" &&
            t !== "gpml_member_entities" &&
            t !== "plastics" &&
            t !== "waste management" &&
            t !== "marine litter" &&
            t !== "capacity building" &&
            t !== "product by design" &&
            t !== "source to sea"
        );

  const totalItems = filteredTopics.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  );

  const pageNumber = query?.offset?.map((count) => Number(count))[0] || 0;

  const itemCount = loading
    ? 0
    : pageNumber !== undefined
    ? totalItems
    : pageSize;

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  return (
    <Row style={{ postion: "relative" }}>
      <Col
        span={24}
        className={`resource-list ${
          (loading && "empty-container") ||
          (allResults.length == 0 && "empty-container")
        }`}
        style={!loading && !isEmpty(allResults) && { overflowY: "auto" }}
      >
        <div className="subheader">
          <p>
            {totalItems > pageSize + pageNumber
              ? pageSize + pageNumber
              : itemCount}{" "}
            of {totalItems || 0} result{totalItems > 1 ? "s" : ""}
          </p>
          <div className="sort-by" onClick={() => sortResults(!isAscending)}>
            <SortIcon
              style={{
                transform:
                  isAscending || isAscending === null
                    ? "initial"
                    : "rotate(180deg)",
              }}
            />
            <div>
              <span>Sort by:</span>
              <b>{isAscending ? `A>Z` : "Z>A"}</b>
            </div>
          </div>
        </div>
        {loading ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading
          </h2>
        ) : !loading && !isEmpty(allResults) ? (
          <>
            <ResourceItem
              setParams={setParams}
              view={view}
              results={allResults}
              stakeholders={stakeholders}
              setIsShownModal={setIsShownModal}
              setData={setData}
              setDataProperties={setDataProperties}
              history={history}
              setIsShowModal={setIsShowModal}
            />
            {isShowModal && (
              <DetailModal
                match={{ params }}
                setStakeholderSignupModalVisible={() => null}
                setFilterMenu={() => null}
                isAuthenticated={true}
                isShowModal={isShowModal}
                setIsShowModal={setIsShowModal}
              />
            )}
          </>
        ) : (
          <h2 className="loading ">There is no data to display</h2>
        )}
      </Col>
      {!isEmpty(allResults) && (
        <div className="page">
          <Pagination
            defaultCurrent={1}
            current={(pageNumber || 0) / pageSize + 1}
            pageSize={pageSize}
            total={totalItems}
            showSizeChanger={false}
            onChange={(n, size) => updateQuery("offset", (n - 1) * size)}
          />
        </div>
      )}
    </Row>
  );
};

const ResourceItem = ({
  results,
  view,
  stakeholders,
  setParams,
  history,
  setIsShowModal,
}) => {
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
    const linkTo = `/${type.replace("_", "-")}/${id}`;
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
      <div
        className="resource-item-wrapper"
        key={`${type}-${id}`}
        onClick={() => {
          setParams({ type, id });
          history.push(linkTo);
          setIsShowModal(true);
        }}
      >
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
            <span className="avatar-count">
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
      </div>
    );
  });
};

export default ResourceList;
