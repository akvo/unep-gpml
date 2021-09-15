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
  Input,
} from "antd";
import React, { Fragment } from "react";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { fetchArchiveData, fetchSubmissionData } from "./utils";
import moment from "moment";
import capitalize from "lodash/capitalize";
import isEmpty from "lodash/isEmpty";
import { DetailCollapse } from "./preview";
import {
  topicNames,
  resourceTypeToTopicType,
  reviewStatusUIText,
  publishStatusUIText,
} from "../../utils/misc";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import Avatar from "antd/lib/avatar/avatar";

const { Search } = Input;

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

const HeaderSearch = () => {
  return (
    <Search
      className="search"
      placeholder="Search for a resource"
      allowClear
      onSearch={console.log("hi")}
    />
  );
};

const AdminSection = ({
  pendingItems,
  setPendingItems,
  archiveItems,
  setArchiveItems,
}) => {
  const archiveData = archiveItems.data;
  const profile = UIStore.useState((s) => s.profile);
  const [modalRejectVisible, setModalRejectVisible] = useState(false);
  const [modalRejectFunction, setModalRejectFunction] = useState(false);
  const [previewContent, storePreviewContent] = useState({});
  const [approveLoading, setApproveLoading] = useState({});
  const [reviewers, setReviewers] = useState([]);
  const [loadingAssignReviewer, setLoadingAssignReviewer] = useState(false);

  useEffect(() => {
    api.get("/reviewer").then((res) => {
      setReviewers(res.data);
    });
  }, []);

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

  const assignReviewer = (item, reviewer) => {
    setLoadingAssignReviewer(item);
    const data = { reviewer };
    const apiCall = item?.reviewer?.id ? api.patch : api.post;
    apiCall(`/review/${item.type}/${item.id}`, data).then((res) => {
      setLoadingAssignReviewer(false);
      (async () => {
        const { page, limit } = pendingItems;
        setPendingItems(await fetchSubmissionData(page, limit));
      })();
    });
  };

  const ReviewStatus = ({ item }) => {
    return (
      <Select
        showSearch={true}
        className="select-reviewer"
        placeholder="Assign reviewer"
        onChange={(reviewerId) => assignReviewer(item, reviewerId)}
        defaultValue={item?.reviewer?.id}
        filterOption={(input, option) =>
          option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        options={reviewers.map((r) => {
          return { value: r.id, label: r.email };
        })}
      />
    );
  };

  const renderNewApprovalRequests = () => {
    const onChangePagePending = (current, pageSize) => {
      (async () => {
        const size = pageSize ? pageSize : pendingItems.limit;
        setPendingItems(await fetchSubmissionData(current, size));
      })();
    };

    const ApproveButton = ({
      item,
      type,
      className = "",
      disabled = false,
    }) => (
      <Button
        type={type}
        className={className}
        disabled={disabled}
        onClick={review(item, "APPROVED")}
        loading={
          !isEmpty(approveLoading) &&
          item?.id === approveLoading?.id &&
          item?.type === approveLoading?.type
        }
      >
        {publishStatusUIText["APPROVE"]}
      </Button>
    );

    return (
      <div key="new-approval" className="approval">
        <h2>New resources</h2>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch />
          </div>
          <Collapse onChange={getPreviewContent}>
            {pendingItems?.data && pendingItems?.data?.length > 0 ? (
              pendingItems.data.map((item, index) => (
                <Collapse.Panel
                  key={item.preview}
                  className={`request-collapse-panel-item ${
                    item?.reviewer?.id ? "status-show" : "status-none"
                  }`}
                  header={
                    <>
                      <div className="content-status">
                        {loadingAssignReviewer.id === item?.id &&
                          loadingAssignReviewer.type === item?.type && (
                            <span className="status">
                              <LoadingOutlined spin /> Loading
                            </span>
                          )}
                        {(loadingAssignReviewer.id !== item?.id ||
                          loadingAssignReviewer.type !== item?.type ||
                          !loadingAssignReviewer) &&
                          item?.reviewer?.id && (
                            <span className="status">
                              {reviewStatusUIText[item.reviewStatus]}
                            </span>
                          )}
                      </div>
                      <div className="row">
                        <div className="col content">
                          <Avatar
                            className="content-img"
                            size={{
                              xs: 24,
                              sm: 32,
                              md: 40,
                              lg: 50,
                              xl: 50,
                              xxl: 50,
                            }}
                            icon={item.picture || <UserOutlined />}
                          />
                          <div className="content-body">
                            <div className="title">
                              {item.title || "No Title"}
                            </div>
                            <div className="topic">{topicNames(item.type)}</div>
                          </div>
                        </div>
                        <div
                          className="col reviewer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <ReviewStatus item={item} />
                        </div>
                        <div
                          className="col action"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Space size="small">
                            {item.type === "profile" ? (
                              item.emailVerified ? (
                                <ApproveButton
                                  item={item}
                                  type="ghost"
                                  className="black"
                                />
                              ) : (
                                <Tooltip title="Profile cannot be approved since email is not verified">
                                  <ApproveButton
                                    item={item}
                                    type="secondary"
                                    disabled={true}
                                  />
                                </Tooltip>
                              )
                            ) : item.type === "policy" ? (
                              <Tooltip title="Policies are imported from Law division system">
                                <ApproveButton
                                  item={item}
                                  type="secondary"
                                  disabled={true}
                                />
                              </Tooltip>
                            ) : (
                              <ApproveButton
                                item={item}
                                type="ghost"
                                className="black"
                              />
                            )}
                            <Button
                              type="link"
                              className="black"
                              onClick={reject(item, "REJECTED")}
                            >
                              Decline
                            </Button>
                          </Space>
                        </div>
                      </div>
                    </>
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
        </div>
        <div className="pagination-wrapper">
          <Pagination
            defaultCurrent={1}
            onChange={onChangePagePending}
            current={pendingItems.page}
            pageSize={pendingItems.limit}
            total={pendingItems.count}
            defaultPageSize={pendingItems.limit}
          />
        </div>
      </div>
    );
  };

  const renderArchiveRequests = () => {
    const onChangePageArchive = async (current, pageSize) => {
      const size = pageSize ? pageSize : archiveItems.limit;
      const archive = await fetchArchiveData(current, size);
      setArchiveItems(archive);
    };

    return (
      <div key="archive-requests" className="archive">
        <h2>Requests archive ({archiveItems.count})</h2>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch />
          </div>
          <Collapse onChange={getPreviewContent}>
            {archiveData.length > 0 ? (
              archiveData.map((item, index) => (
                <Collapse.Panel
                  key={item.preview}
                  className="archive-collapse-panel-item status-show"
                  header={
                    <>
                      <div className="content-status">
                        <span className="status">
                          {publishStatusUIText[item.reviewStatus]}
                        </span>
                      </div>
                      <div className="row">
                        <div className="col content">
                          <Avatar
                            className="content-img"
                            size={{
                              xs: 24,
                              sm: 32,
                              md: 40,
                              lg: 50,
                              xl: 50,
                              xxl: 50,
                            }}
                            icon={item.picture || <UserOutlined />}
                          />
                          <div className="content-body">
                            <div className="title">
                              {item.title || "No Title"}
                            </div>
                            <div className="topic">{topicNames(item.type)}</div>
                          </div>
                        </div>
                      </div>
                    </>
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
        </div>
        <div className="pagination-wrapper">
          <Pagination
            defaultCurrent={1}
            current={archiveItems.page}
            onChange={onChangePageArchive}
            pageSize={archiveItems.limit}
            total={archiveItems.count}
            defaultPageSize={archiveItems.limit}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="admin-view">
      {/* <div className="download-container">
        <p>Download the data</p>
        <Select showSearch style={{ width: 350 }} placeholder="Select data">
          <Select.Option value="demo">Demo</Select.Option>
        </Select>
        <div className="btn-download">
          <Button type="primary">Download as .csv</Button>
        </div>
      </div> */}
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

export { AdminSection, HeaderSearch };
