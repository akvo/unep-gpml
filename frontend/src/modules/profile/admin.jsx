import { UIStore } from "../../store";
import {
  Button,
  Collapse,
  Space,
  Modal,
  Select,
  Pagination,
  Tooltip,
  Input,
  Tabs,
} from "antd";
import React from "react";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { fetchArchiveData, fetchSubmissionData } from "./utils";
import moment from "moment";
import isEmpty from "lodash/isEmpty";
import { DetailCollapse } from "./preview";
import {
  topicNames,
  resourceTypeToTopicType,
  reviewStatusUIText,
  publishStatusUIText,
} from "../../utils/misc";
import {
  LoadingOutlined,
  UserOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import Avatar from "antd/lib/avatar/avatar";

const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

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

const HeaderSearch = ({ placeholder }) => {
  return (
    <Search
      className="search"
      placeholder={placeholder ? placeholder : "Search for a resource"}
      allowClear
      onSearch={() => console.log("search")}
    />
  );
};

const HeaderFilter = () => {
  return (
    <Select
      showSearch
      allowClear
      className="filter-by-status"
      onChange={null}
      optionLabelProp="label"
      placeholder={
        <>
          <FilterOutlined className="filter-icon" /> Filter by status
        </>
      }
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {["Approved", "Pending"].map((x, i) => (
        <Option
          key={`${x}-${i}`}
          value={x}
          label={
            <>
              <FilterOutlined className="filter-icon" /> {x}
            </>
          }
        >
          {x}
        </Option>
      ))}
    </Select>
  );
};

const AdminSection = ({
  pendingItems,
  setPendingItems,
  archiveItems,
  setArchiveItems,
}) => {
  const profile = UIStore.useState((s) => s.profile);
  const [modalRejectVisible, setModalRejectVisible] = useState(false);
  const [modalRejectFunction, setModalRejectFunction] = useState(false);
  const [previewContent, storePreviewContent] = useState({});
  const [approveLoading, setApproveLoading] = useState({});
  const [reviewers, setReviewers] = useState([]);
  const [loadingAssignReviewer, setLoadingAssignReviewer] = useState(false);
  const [tab, setTab] = useState("stakeholders-entities");
  const archiveData =
    tab === "resources" ? [] : tab === "tags" ? [] : archiveItems.data;

  useEffect(() => {
    api.get("/reviewer").then((res) => {
      setReviewers(res.data);
    });
  }, []);

  const review = (item, review_status) => () => {
    setApproveLoading({ ...item, button: review_status });
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
    const itemList =
      tab === "resources" ? [] : tab === "tags" ? [] : pendingItems;
    const sectionTitle =
      tab === "resources"
        ? "New Resources"
        : tab === "tags"
        ? "New Tags"
        : "New Approval Request";

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
          approveLoading?.button === "APPROVED" &&
          item?.id === approveLoading?.id &&
          item?.type === approveLoading?.type
        }
      >
        {publishStatusUIText["APPROVE"]}
      </Button>
    );

    return (
      <div key="new-approval" className="approval">
        <h2>
          {sectionTitle} ({itemList.count || 0})
        </h2>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch />
            <HeaderFilter />
          </div>
          <Collapse onChange={getPreviewContent}>
            {itemList?.data && itemList?.data?.length > 0 ? (
              itemList.data.map((item, index) => (
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
                            <span
                              className={`status ${item.reviewStatus.toLowerCase()}`}
                            >
                              {reviewStatusUIText[item.reviewStatus]}
                            </span>
                          )}
                      </div>
                      <div className="row">
                        <div className="col content">
                          <Avatar
                            className="content-img"
                            size={50}
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
                              loading={
                                !isEmpty(approveLoading) &&
                                approveLoading?.button === "REJECTED" &&
                                item?.id === approveLoading?.id &&
                                item?.type === approveLoading?.type
                              }
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
            current={itemList.page || 1}
            pageSize={itemList.limit || 10}
            total={itemList.count || 0}
            defaultPageSize={itemList.limit || 10}
          />
        </div>
      </div>
    );
  };

  const renderArchiveRequests = () => {
    const itemList =
      tab === "resources" ? [] : tab === "tags" ? [] : archiveItems;

    const onChangePageArchive = async (current, pageSize) => {
      const size = pageSize ? pageSize : archiveItems.limit;
      const archive = await fetchArchiveData(current, size);
      setArchiveItems(archive);
    };

    return (
      <div key="archive-requests" className="archive">
        <h2>Requests archive ({itemList.count || 0})</h2>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch />
            <HeaderFilter />
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
                            size={50}
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
            current={itemList.page || 1}
            onChange={onChangePageArchive}
            pageSize={itemList.limit || 10}
            total={itemList.count || 0}
            defaultPageSize={itemList.limit || 10}
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
      <Tabs
        onChange={(key) => setTab(key)}
        type="card"
        size="large"
        className="profile-tab-menu"
      >
        <TabPane
          tab="Stakeholders & Entities"
          key="stakeholders-entities"
          className="profile-tab-pane"
        >
          {renderNewApprovalRequests()}
          {renderArchiveRequests()}
        </TabPane>
        <TabPane tab="Resources" key="resources" className="profile-tab-pane">
          {renderNewApprovalRequests()}
          {renderArchiveRequests()}
        </TabPane>
        <TabPane tab="Tags" key="tags" className="profile-tab-pane">
          {renderNewApprovalRequests()}
          {renderArchiveRequests()}
        </TabPane>
      </Tabs>

      <ModalReject
        visible={modalRejectVisible}
        reject={modalRejectFunction}
        close={() => setModalRejectVisible(false)}
      />
    </div>
  );
};

export { AdminSection, HeaderSearch, HeaderFilter };
