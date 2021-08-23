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
import { fetchArchiveData, fetchSubmissionData } from "./utils";
import moment from "moment";
import capitalize from "lodash/capitalize";
import find from "lodash/find";
import { DetailCollapse } from "./preview";
import { topicNames, resourceTypeToTopicType } from "../../utils/misc";

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
  const [approveLoading, setApproveLoading] = useState({});

  const review = (item, review_status) => () => {
    setApproveLoading(item);
    const itemType =
      item.type === "project"
        ? "initiative"
        : resourceTypeToTopicType(item.type);
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
        (async () => {
          const { page, limit } = pendingItems;
          const items = await fetchSubmissionData(page, limit);
          setPendingItems(items);
          setApproveLoading({});
        })();
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

  const renderNewApprovalRequests = () => {
    const onChangePagePending = (page) => {
      (async () => {
        const { limit } = pendingItems;
        setPendingItems(await fetchSubmissionData(page, limit));
      })();
    };
    const onChangePagePendingSize = (page, limit) => {
      (async () => {
        setPendingItems(await fetchSubmissionData(page, limit));
      })();
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
          {pendingItems?.data && pendingItems?.data?.length > 0 ? (
            pendingItems.data.map((item, index) => (
              <Collapse.Panel
                key={item.preview}
                header={
                  <div className="row">
                    <div className="col">{topicNames(item.type)}</div>
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
                        ) : item.type === "policy" ? (
                          <Tooltip title="Policies are imported from Law division system">
                            <Button
                              type="secondary"
                              disabled={true}
                              onClick={review(item, "APPROVED")}
                            >
                              Approve
                            </Button>
                          </Tooltip>
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
            ))
          ) : (
            <Collapse.Panel
              showArrow={false}
              key="collapse-pending-no-data"
              header={<div className="row">No data to display</div>}
            ></Collapse.Panel>
          )}
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
    const onChangePageArchive = async (p) => {
      const archive = await fetchArchiveData(p, archiveItems.limit);
      setArchiveItems(archive);
    };
    const onChangePageArchiveSize = async (p, l) => {
      const archive = await fetchArchiveData(p, l);
      setArchiveItems(archive);
    };
    return (
      <div className="archive">
        <h2>Requests archive ({archiveItems.count})</h2>
        <div className="row head">
          <div className="col">Type</div>
          <div className="col">Name</div>
          <div className="col">Status</div>
        </div>
        <Collapse onChange={getPreviewContent}>
          {archiveData.length > 0 ? (
            archiveData.map((item, index) => (
              <Collapse.Panel
                key={item.preview}
                header={
                  <div className="row">
                    <div className="col">{topicNames(item.type)}</div>
                    <div className="col">{item.title}</div>
                    <div className="col status">
                      {capitalize(item.reviewStatus)}
                    </div>
                  </div>
                }
              >
                <DetailCollapse
                  data={previewContent?.[item.preview] || {}}
                  item={item}
                />
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
