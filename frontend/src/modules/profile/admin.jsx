import { UIStore } from "../../store";
import {
  Button,
  Collapse,
  Space,
  Spin,
  Modal,
  Form,
  Select,
  Pagination,
  Tooltip,
} from "antd";
import React, { Fragment } from "react";
import { useState } from "react";
import api from "../../utils/api";
import moment from "moment";
import capitalize from "lodash/capitalize";
import find from "lodash/find";
import values from "lodash/values";
import imageNotFound from "../../images/image-not-found.png";
import { languages } from "countries-list";

const ModalReject = ({ visible, close, reject, item }) => {
  return (
    <Modal
      width={600}
      okText="Close"
      visible={visible}
      footer={
        <div>
          <Button onClick={(e) => reject()}>Yes</Button>
          <Button onClick={(e) => close()} type="primary">
            No
          </Button>
        </div>
      }
      closable={false}
    >
      <div className="warning-modal-user">
        <p>Are you sure you want to decline?</p>
      </div>
    </Modal>
  );
};

const AdminSection = ({
  pendingItems,
  setPendingItems,
  archiveItems,
  setArchiveItems,
}) => {
  const archiveData = archiveItems.data;
  const { countries, profile } = UIStore.currentState;
  const [modalRejectVisible, setModalRejectVisible] = useState(false);
  const [modalRejectFunction, setModalRejectFunction] = useState(false);

  const review = (item, review_status) => () => {
    api
      .put(`/${item.type}/review`, {
        id: item.id,
        review_status: review_status,
      })
      .then(() => {
        let title = item.title;
        title = item?.firstName ? `${title} ${item.firstName}` : title;
        title = item?.lastName ? `${title} ${item.lastName}` : title;
        const newArchive = {
          ...item,
          title: title,
          type: item.type,
          createdBy: item.submitter ? item.submitter : null,
          reviewStatus: review_status,
          reviewedBy: profile.firstName + " " + profile.lastName,
          reviewedAt: moment().format("L LT"),
        };
        setArchiveItems({
          ...archiveItems,
          data: [newArchive, ...archiveData],
          count: archiveItems.count + 1,
        });
        setPendingItems(pendingItems.filter((it) => it.id !== item.id));
        setModalRejectVisible(false);
      });
  };

  const reject = (item, review_status) => () => {
    setModalRejectFunction(() => review(item, review_status));
    setModalRejectVisible(true);
  };

  const findCountries = (item, isCountry = false) => {
    const {
      country,
      geoCoverageType,
      geoCoverageValue,
      geoCoverageValues,
    } = item;
    if (isCountry) {
      return country ? find(countries, (x) => x.isoCode === country).name : "-";
    }

    if (
      (geoCoverageType === "regional" ||
        geoCoverageType === "global with elements in specific areas") &&
      (geoCoverageValue !== null || geoCoverageValues !== null)
    ) {
      const values = geoCoverageValues || geoCoverageValue;
      if (values === null) {
        return "-";
      }
      return values.join(", ");
    }

    if (
      geoCoverageType === "global" &&
      (geoCoverageValue === null || geoCoverageValues === null)
    ) {
      return (
        <div className="scrollable">
          {values(countries)
            .map((c) => c.name)
            .join(", ")}
        </div>
      );
    }

    if (
      (geoCoverageType === "transnational" ||
        geoCoverageType === "national" ||
        geoCoverageType === "sub-national") &&
      (geoCoverageValue !== null || geoCoverageValues !== null)
    ) {
      const values = geoCoverageValues || geoCoverageValue;
      if (values === null || typeof values === "undefined") {
        return "-";
      }
      return (
        <div className="scrollable">
          {values
            .map((v) => {
              return find(countries, (x) => x.isoCode === v).name;
            })
            .join(", ")}
        </div>
      );
    }
    return "-";
  };

  const renderNewApprovalRequests = () => {
    return (
      <Fragment key="new-approval">
        <h2>New approval requests</h2>
        {/* {loading && <Spin size="large" />} */}
        <div className="row head">
          <div className="col">Type</div>
          <div className="col">Name</div>
          <div className="col">Action</div>
        </div>
        <Collapse>
          {pendingItems.map((item, index) => (
            <Collapse.Panel
              key={`collapse-${index}`}
              header={
                <div className="row">
                  <div className="col">{capitalize(item.type)}</div>
                  <div className="col">
                    {item.type === "event" && item.title}
                    {item.type === "profile" &&
                      `${item.title} ${item.firstName} ${item.lastName}`}
                  </div>
                  <div
                    className="col"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Space size="middle">
                      {item.emailVerified ? (
                        <Button
                          type="primary"
                          onClick={review(item, "APPROVED")}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Tooltip title="Profile cannot be approved since email is not verified">
                          <Button
                            type="primary"
                            disabled={true}
                            onClick={review(item, "APPROVED")}
                          >
                            Approve
                          </Button>
                        </Tooltip>
                      )}
                      <Button type="link" onClick={reject(item, "REJECTED")}>
                        Decline
                      </Button>
                    </Space>
                  </div>
                </div>
              }
            >
              <div>
                {item.type === "profile" && (
                  <div className="stakeholder-info">
                    <div className="left">
                      <div className="info-img">
                        {item.photo && (
                          <div className="info-img">
                            <img src={item.photo} alt="profile" />
                          </div>
                        )}
                      </div>

                      <ul>
                        <li>
                          <p className="section-title">Personal Details</p>
                        </li>
                        <li>
                          <div className="detail-title">Email</div>:
                          <div className="detail-content">
                            {item.email || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">Linkedin</div>:
                          <div className="detail-content">
                            {item.linkedIn || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">Twitter</div>:
                          <div className="detail-content">
                            {item.twitter || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">
                            Representative sector
                          </div>
                          :
                          <div className="detail-content">
                            {item.representation || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">Country</div>:
                          <div className="detail-content">{item.country}</div>
                        </li>
                        <li>
                          <div className="detail-title">Geo coverage type</div>:
                          <div className="detail-content">
                            {capitalize(item.geoCoverageType) || "-"}
                          </div>
                        </li>
                        {item.geoCoverageType !== "global" && (
                          <li>
                            <div className="detail-title">Geo coverage</div>:
                            <div className="detail-content">
                              {findCountries(item)}
                            </div>
                          </li>
                        )}
                        <li>
                          <div className="detail-title">Organisation</div>:
                          <div className="detail-content">
                            <ul>
                              {(item.org && (
                                <li>
                                  <a
                                    href={item.org.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {item.org.name}
                                  </a>
                                </li>
                              )) ||
                                "-"}
                            </ul>
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">Organisation Role</div>:
                          <div className="detail-content">
                            {item.organisationRole || "-"}
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="right">
                      <ul>
                        <li>
                          <p className="section-title">
                            Expertise and Activities
                          </p>
                        </li>
                        <li>
                          <div className="detail-title">Seeking</div>:
                          <div className="detail-content">
                            {(item.seeking && item.seeking.join(", ")) || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">Offering</div>:
                          <div className="detail-content">
                            {(item.offering && item.offering.join(", ")) || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">About yourself</div>:
                          <div className="detail-content">
                            {item.about || "-"}
                          </div>
                        </li>
                        <li>
                          <div className="detail-title">Tags</div>:
                          <div className="detail-content">
                            {(item.tags && item.tags.join(", ")) || "-"}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                {item.type === "event" && (
                  <div className="event-info">
                    <div className="info-img">
                      <img src={item.image || imageNotFound} alt="event" />
                    </div>
                    <ul>
                      <li>
                        <div className="detail-title">Submitted At</div>:
                        <div className="detail-content">
                          {moment(item.createdAt).format("DD MMM YYYY")}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Submitted By</div>:
                        <div className="detail-content">
                          <b>{item?.submitter && item.submitter}</b>
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Event Date</div>:
                        <div className="detail-content">
                          {moment(item.startDate).format("DD MMM YYYY")} to{" "}
                          {moment(item.endDate).format("DD MMM YYYY")}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Country</div>:
                        <div className="detail-content">
                          {findCountries(item, true) || "-"}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">City</div>:
                        <div className="detail-content">{item.city || "-"}</div>
                      </li>
                      <li>
                        <div className="detail-title">Geo coverage type</div>:
                        <div className="detail-content">
                          <b>{capitalize(item.geoCoverageType) || "-"}</b>
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Geo coverage</div>:
                        <div className="detail-content">
                          {findCountries(item)}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Description</div>:
                        <div className="detail-content">
                          {item.description || "-"}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Remarks</div>:
                        <div className="detail-content">
                          {item.remarks || "-"}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Tags</div>:
                        <div className="detail-content">
                          {(item.tags && item.tags.join(", ")) || "-"}
                        </div>
                      </li>
                      <li>
                        <div className="detail-title">Urls</div>:
                        <div className="detail-content">
                          {item?.urls && (
                            <ul className={"ul-children"}>
                              {item.urls.map((x, i) => (
                                <li key={`url-${i}`}>
                                  {languages[x.isoCode].name} : {x.url}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Fragment>
    );
  };

  const renderArchiveRequests = () => {
    const onChangePageArchive = (p) => {
      api
        .get("/archive?page=" + p + "&limit=" + archiveItems.limit)
        .then((res) => {
          setArchiveItems(res.data);
        });
    };
    const onChangePageArchiveSize = (p, l) => {
      api.get("/archive?page=" + p + "&limit=" + l).then((res) => {
        setArchiveItems(res.data);
      });
    };
    return (
      <div className="archive">
        <h2>Requests archive ({archiveItems.count})</h2>
        {/* {loading && <Spin size="large" />} */}
        <div className="row head">
          <div className="col">Type</div>
          <div className="col">Name</div>
          <div className="col">Status</div>
        </div>
        <Collapse>
          {archiveData.length > 0 ? (
            archiveData.map((item, index) => (
              <Collapse.Panel
                key={`collapse-archive-${index}`}
                header={
                  <div className="row">
                    <div className="col">{capitalize(item.type)}</div>
                    <div className="col">{item.title}</div>
                    <div className="col status">
                      {capitalize(item.reviewStatus)}
                    </div>
                  </div>
                }
              >
                <div className="event-info">
                  <ul>
                    <li>
                      <div className="detail-title">Submitted by</div>:
                      {item.createdBy ? (
                        <div className="detail-content">{item.createdBy}</div>
                      ) : (
                        <div className="detail-content">Imported</div>
                      )}
                    </li>
                    <li>
                      <div className="detail-title">Reviewed by</div>:
                      {item.reviewedBy.trim() !== "" ? (
                        <div className="detail-content">{item.reviewedBy}</div>
                      ) : (
                        <div className="detail-content">Auto Approved</div>
                      )}
                    </li>
                    <li>
                      <div className="detail-title">Reviewed At</div>:
                      <div className="detail-content">{item.reviewedAt}</div>
                    </li>
                  </ul>
                </div>
              </Collapse.Panel>
            ))
          ) : (
            <Collapse.Panel
              showArrow={false}
              key="collapse-archive-no-data"
              header={<div className="row">No data to display</div>}
            ></Collapse.Panel>
          )}
        </Collapse>
        <div style={{ padding: "10px 0px" }}>
          <Pagination
            defaultCurrent={1}
            current={archiveItems.page}
            onChange={onChangePageArchive}
            pageSize={archiveItems.limit}
            total={archiveItems.count}
            defaultPageSize={archiveItems.limit}
            onShowSizeChange={onChangePageArchiveSize}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="admin-view">
      <div className="download-container">
        <p>Download the data</p>
        <Select showSearch style={{ width: 350 }} placeholder="Select data">
          <Select.Option value="demo">Demo</Select.Option>
        </Select>
        <div className="btn-download">
          <Button type="primary">Download as .csv</Button>
        </div>
      </div>
      {renderNewApprovalRequests()}
      {renderArchiveRequests()}
      <ModalReject
        visible={modalRejectVisible}
        reject={modalRejectFunction}
        close={() => setModalRejectVisible(false)}
      />
    </div>
  );
};

export default AdminSection;
