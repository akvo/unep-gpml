import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Pagination, Tag, PageHeader, Button } from "antd";
import { TrimText } from "../../utils/string";
import { isEmpty } from "lodash";
import { topicNames } from "../../utils/misc";
import "./stakeholder-list.scss";
import { LoadingOutlined } from "@ant-design/icons";
import { ReactComponent as GPMLIcon } from "../../images/stakeholder-overview/gpml-logo.svg";
import SortIcon from "../../images/knowledge-library/sort-icon.svg";
import HideIcon from "../../images/knowledge-library/hide-icon.svg";

const StakeholderList = ({
  view,
  results,
  isAscending,
  sortPeople,
  pageSize,
  filters,
  itemCount,
  loading,
  updateQuery,
  isLoaded,
  resultCount,
  resultCounts,
  query,
}) => {
  const [listVisible, setListVisible] = useState(true);

  return (
    <div className="stakeholder-list ">
      <Row>
        {/* <Col span={24}>
          {!listVisible ? (
            <div className="map-overlay">
              <PageHeader
                className="resource-list-header show-list"
                ghost={false}
                backIcon={
                  <img
                    src={HideIcon}
                    className="hide-icon show"
                    alt="show-icon"
                  />
                }
                onBack={() => setListVisible(true)}
                title="Show List"
              />
            </div>
          ) : (
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
                <img
                  src={HideIcon}
                  className="hide-icon hide"
                  alt="hide-icon"
                />
              }
              title={<span className="hide-text">Hide List</span>}
              subTitle={
                !loading && (
                  <span className="result-number">
                    Showing{" "}
                    {resultCount > pageSize + Number(filters?.page)
                      ? resultCounts
                      : itemCount}{" "}
                    of {resultCount || 0} result
                    {resultCount > 1 ? "s" : ""}
                  </span>
                )
              }
            />
          )}
        </Col> */}
        {listVisible && (
          <div style={{ width: "100%" }}>
            <Col
              span={24}
              className="resource-list"
              style={
                isLoaded() &&
                !loading &&
                !isEmpty(results) && { overflowY: "auto" }
              }
            >
              {!isLoaded() || loading ? (
                <h2 className="loading">
                  <LoadingOutlined spin /> Loading
                </h2>
              ) : isLoaded() && !loading && !isEmpty(results) ? (
                <ResourceItem view={view} results={results} />
              ) : (
                <h2 className="loading">There is no data to display</h2>
              )}
            </Col>
            {!isEmpty(results) && (
              <div className="page">
                <Pagination
                  defaultCurrent={1}
                  current={
                    1 + (query?.page.length !== 0 ? Number(query?.page[0]) : 0)
                  }
                  pageSize={pageSize}
                  total={resultCount}
                  showSizeChanger={false}
                  onChange={(n) => {
                    updateQuery("page", n - 1);
                  }}
                />

                <div
                  className="result-number"
                  style={{ opacity: loading && "0" }}
                >
                  {resultCount > pageSize + Number(filters?.page)
                    ? resultCounts
                    : itemCount}{" "}
                  of {resultCount || 0} result
                  {resultCount > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        )}
      </Row>
    </div>
  );
};

const ResourceItem = ({ results, view }) => {
  return results.map((result) => {
    const { id, type } = result;

    const stakeholderName =
      result?.name || `${result?.firstName} ${result?.lastName}`;

    const linkTo = `/${type}/${id}`;

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
          <div className="item-body">
            <div className="badge-wrapper">
              {result.type === "organisation" && result.isMember && (
                <GPMLIcon />
              )}
            </div>
            <div className="resource-image-wrapper">
              <img
                className="resource-item-image"
                src={result?.logo || result?.picture}
                alt=""
              />
            </div>
            <div className="resource-details">
              <b className="title">
                <TrimText text={stakeholderName} max={30} />
              </b>
              <div>
                {result?.type === "stakeholder"
                  ? result?.affiliation && (
                      <span className="entity-name">
                        <TrimText text={result?.affiliation?.name} max={30} />
                      </span>
                    )
                  : ""}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  });
};

export default StakeholderList;
