import React, { useState } from "react";
import { Card, Row, Col, Pagination, Avatar } from "antd";
import { TrimText } from "../../utils/string";
import { isEmpty } from "lodash";
import styles from "./stakeholder-list.module.scss";
import { LoadingOutlined } from "@ant-design/icons";
import Link from "next/link";

const StakeholderList = ({
  view,
  query,
  results,
  pageSize,
  itemCount,
  loading,
  updateQuery,
  isLoaded,
  resultCount,
  resultCounts,
}) => {
  const [listVisible, setListVisible] = useState(true);

  const viewport = window.innerWidth;

  const pageNumber = query?.page?.map((count) => Number(count))[0];

  return (
    <div className={`${styles.stakeholderList} stakeholder-list`}>
      <Row>
        {listVisible && (
          <div style={{ width: "100%" }}>
            <Col
              span={24}
              className="resource-list"
              style={
                isLoaded() &&
                !loading &&
                !isEmpty(results) && {
                  overflowY: "auto",
                  display: viewport > 950 ? "flex" : "grid",
                }
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
                  {resultCount > pageSize + pageNumber
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
      <Link key={`${type}-${id}`} href={linkTo} legacyBehavior>
        <a className="resource-item-wrapper">
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
                    <Avatar
                      size={32}
                      style={{
                        border: "none",
                      }}
                      src={
                        result?.affiliation?.logo ? (
                          result?.affiliation?.logo
                        ) : (
                          <Avatar
                            style={{
                              backgroundColor: "#006776",
                              verticalAlign: "middle",
                              border: "none",
                            }}
                            size={32}
                          >
                            {result?.affiliation?.name?.substring(0, 2)}
                          </Avatar>
                        )
                      }
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
        </a>
      </Link>
    );
  });
};

export default StakeholderList;
