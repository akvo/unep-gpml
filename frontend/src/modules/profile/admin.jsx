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
import { ProfilePreview, GeneralPreview } from "./preview";

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
  const { profile } = UIStore.currentState;
  const [modalRejectVisible, setModalRejectVisible] = useState(false);
  const [modalRejectFunction, setModalRejectFunction] = useState(false);
  const [previewContent, storePreviewContent] = useState({});

  const review = (item, review_status) => () => {
    const itemType =
      item.type === "profile"
        ? "stakeholder"
        : ["Technical Resource", "Financing Resource", "Action Plan"].includes(
            item.type
          )
        ? "resource"
        : item.type;
    api
      .put("submission", {
        id: item.id,
        itemType: itemType,
        reviewStatus: review_status,
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
        api
          .get(
            "/submission?page=" +
              pendingItems.page +
              "&limit=" +
              pendingItems.limit
          )
          .then((res) => {
            setPendingItems(res.data);
          });
        setModalRejectVisible(false);
      });
  };

  const reject = (item, review_status) => () => {
    setModalRejectFunction(() => review(item, review_status));
    setModalRejectVisible(true);
  };

  const getPreviewContent = (urls) => {
    if (urls.length > 0) {
      urls.forEach((url) => {
        if (!previewContent[url]) {
          api.get(url).then((res) => {
            storePreviewContent({ ...previewContent, [url]: res.data });
          });
        }
      });
    }
  };

  const DetailCollapse = ({ data, item }) => {
    switch (item.type) {
      case "profile":
        return <ProfilePreview item={{ ...data, ...item }} />;
      default:
        return <GeneralPreview item={{ ...data, ...item }} />;
    }
  };

  const renderNewApprovalRequests = () => {
    const onChangePagePending = (p) => {
      api
        .get("/submission?page=" + p + "&limit=" + pendingItems.limit)
        .then((res) => {
          setPendingItems(res.data);
        });
    };
    const onChangePagePendingSize = (p, l) => {
      api.get("/submission?page=" + p + "&limit=" + l).then((res) => {
        setPendingItems(res.data);
      });
    };
    return (
      <Fragment key="new-approval">
        <h2>New approval requests</h2>
        <div className="row head">
          <div className="col">Type</div>
          <div className="col">Name</div>
          <div className="col">Action</div>
        </div>
        <Collapse onChange={getPreviewContent}>
          {pendingItems.data.map((item, index) => (
            <Collapse.Panel
              key={item.preview}
              header={
                <div className="row">
                  <div className="col">{capitalize(item.type)}</div>
                  <div className="col">{item.title}</div>
                  <div
                    className="col"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Space size="middle">
                      {item.type === "profile" ? (
                        item.emailVerified ? (
                          <Button
                            type="primary"
                            onClick={review(item, "APPROVED")}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Tooltip title="Profile cannot be approved since email is not verified">
                            <Button
                              type="secondary"
                              disabled={true}
                              onClick={review(item, "APPROVED")}
                            >
                              Approve
                            </Button>
                          </Tooltip>
                        )
                      ) : (
                        <Button
                          type="primary"
                          onClick={review(item, "APPROVED")}
                        >
                          Approve
                        </Button>
                      )}
                      <Button type="link" onClick={reject(item, "REJECTED")}>
                        Decline
                      </Button>
                    </Space>
                  </div>
                </div>
              }
            >
              <DetailCollapse
                data={previewContent?.[item.preview] || {}}
                item={item}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
        <div style={{ padding: "10px 0px" }}>
          <Pagination
            defaultCurrent={1}
            onChange={onChangePagePending}
            current={pendingItems.page}
            pageSize={pendingItems.limit}
            total={pendingItems.count}
            defaultPageSize={pendingItems.limit}
            onShowSizeChange={onChangePagePendingSize}
          />
        </div>
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
                <div className="general-info">
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
