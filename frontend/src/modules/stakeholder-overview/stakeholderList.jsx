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

  const viewport = window.innerWidth;

  return (
    <div className="stakeholder-list ">
      <Row>
        {listVisible && (
          <div style={{ width: "100%" }}>
            <Col
              span={24}
              className="resource-list"
              style={
                isLoaded() &&
                !loading &&
                !isEmpty(results) &&
                viewport > 950 && { overflowY: "auto" }
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
        <Card className="resource-item" id="stakeholder-item">
          <div className="item-body">
            <div className="resource-images-extra-wrapper">
              <div className="resource-image-wrapper">
                <img
                  className="resource-item-image"
                  src={result?.logo || result?.picture}
                  alt=""
                />
              </div>
              {result?.affiliation && result?.affiliation?.length !== 0 && (
                <div className="list-affiliation-image-wrapper">
                  <img
                    className="affiliation-image"
                    src={
                      result?.affiliation?.logo
                        ? result?.affiliation?.logo
                        : `https://ui-avatars.com/api/?background=0D8ABC&color=ffffff&size=480&name=${result?.affiliation?.name}`
                    }
                    alt={result?.affiliation?.name}
                  />
                </div>
              )}
            </div>
            <div className="resource-details">
              <b className="title">
                <TrimText text={stakeholderName} max={64} />
              </b>
              <div>
                {result?.type === "stakeholder"
                  ? result?.jobTitle && (
                      <span className="entity-name">
                        <TrimText text={result?.jobTitle} max={40} />
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
