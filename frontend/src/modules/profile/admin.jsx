import { UIStore } from "../../store";
import {
  notification,
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
import { fetchSubmissionData, fetchStakeholders } from "./utils";
import moment from "moment";
import isEmpty from "lodash/isEmpty";
import { DetailCollapse } from "./preview";
import {
  userRoles,
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

const ModalReject = ({ visible, close, reject, item, action = "Decline" }) => {
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
        <p>Are you sure you want to {action?.toLowerCase()}?</p>
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

const HeaderFilter = ({
  resources_or_stakeholders,
  setResourcesData,
  setStakeholdersData,
  setTableFilter,
}) => {
  const [headerValue, setHeaderValue] = useState("Pending");
  return (
    <Select
      showSearch
      allowClear
      className="filter-by-status"
      value={headerValue}
      onChange={(x) => {
        setHeaderValue(x);
        console.log(resources_or_stakeholders, x);
        const setFun =
          resources_or_stakeholders === "resources"
            ? setResourcesData
            : setStakeholdersData;
        if (x === "undefined") {
          setTableFilter("SUBMITTED");
          (async () => {
            setFun(
              await fetchSubmissionData(
                1,
                10,
                resources_or_stakeholders,
                "SUBMITTED"
              )
            );
          })();
        } else {
          const review_status =
            x === "Approved"
              ? "APPROVED"
              : x === "Pending"
              ? "SUBMITTED"
              : "REJECTED";
          setTableFilter(review_status);
          console.log(review_status);
          (async () => {
            setFun(
              await fetchSubmissionData(
                1,
                10,
                resources_or_stakeholders,
                review_status
              )
            );
          })();
        }
      }}
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
      {["Approved", "Pending", "Declined"].map((x, i) => (
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

const RoleSelect = ({ stakeholder, onChangeRole, loading }) => {
  return (
    <Select
      showSearch={false}
      style={{ width: "100%" }}
      onChange={(role) => onChangeRole(stakeholder, role)}
      value={[stakeholder?.role]}
      loading={stakeholder?.id === loading}
      // FIXME: Disallow changing roles of other admins?
      // stakeholder?.role === "ADMIN"
      disabled={stakeholder?.id === loading}
    >
      {userRoles.map((r) => (
        <Select.Option key={r} value={r}>
          {r}
        </Select.Option>
      ))}
    </Select>
  );
};

const AdminSection = ({
  resourcesData,
  setResourcesData,
  stakeholdersData,
  setStakeholdersData,
}) => {
  const profile = UIStore.useState((s) => s.profile);
  const [modalRejectVisible, setModalRejectVisible] = useState(false);
  const [modalRejectAction, setModalRejectAction] = useState("decline");
  const [modalRejectFunction, setModalRejectFunction] = useState(false);
  const [previewContent, storePreviewContent] = useState({});
  const [approveLoading, setApproveLoading] = useState({});
  const [reviewers, setReviewers] = useState([]);
  const [loadingAssignReviewer, setLoadingAssignReviewer] = useState(false);
  const [tab, setTab] = useState("stakeholders-entities");

  useEffect(() => {
    api.get("/reviewer").then((res) => {
      setReviewers(res.data);
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [tableFilter, setTableFilter] = useState("SUBMITTED");

  const changeRole = (stakeholder, role) => {
    setLoading(stakeholder.id);
    api
      .patch(`/stakeholder/${stakeholder.id}`, { role })
      .then((resp) => {
        notification.success({ message: "User role changed" });
        // FIXME: Add error handling in case the PATCH fails!
        setLoading(false);
      })
      .then(() => fetchSubmissionData(1, 10, "stakeholders", "APPROVED"))
      .then((x) => setStakeholdersData(x))
      .catch((err) => {
        notification.error({ message: "Something went wrong" });
      });
  };

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
        (async () => {
          const { page, limit } = resourcesData;
          const items = await fetchSubmissionData(
            page,
            limit,
            "resources",
            "SUBMITTED"
          );
          setResourcesData(items);
          setApproveLoading({});
        })();
        (async () => {
          const { page, limit } = stakeholdersData;
          const items = await fetchSubmissionData(
            page,
            limit,
            "stakeholders",
            "SUBMITTED"
          );
          setStakeholdersData(items);
          setApproveLoading({});
        })();
        setModalRejectVisible(false);
      });
  };

  const reject = (item, review_status, action) => () => {
    setModalRejectFunction(() => review(item, review_status));
    setModalRejectAction(action);
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
    const data = { reviewer: reviewer };
    const apiCall = item?.reviewer?.id ? api.patch : api.post;
    apiCall(`/review/${item.type}/${item.id}`, data).then((res) => {
      setLoadingAssignReviewer(false);
      (async () => {
        const { page, limit } = resourcesData;
        setResourcesData(
          await fetchSubmissionData(page, limit, "resources", "SUBMITTED")
        );
      })();
      (async () => {
        const { page, limit } = stakeholdersData;
        setStakeholdersData(
          await fetchSubmissionData(page, limit, "stakeholders", "SUBMITTED")
        );
      })();
    });
  };

  const ReviewStatus = ({ item }) => {
    return (
      <Select
        mode="multiple"
        showSearch={true}
        className="select-reviewer"
        placeholder="Assign reviewer"
        onChange={(reviewerId) => assignReviewer(item, reviewerId)}
        value={item?.reviewer?.id ? [item.reviewer.id] : []}
        filterOption={(input, option) =>
          option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        options={reviewers.map((r) => {
          return { value: r.id, label: r.email };
        })}
      />
    );
  };

  const PublishButton = ({ item, type, className = "", disabled = false }) => (
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

  const UnpublishButton = ({
    item,
    type,
    className = "",
    disabled = false,
    uiTitle = "REJECT",
    action = "REJECTED",
  }) => (
    <Button
      type={type}
      className={className}
      disabled={disabled}
      onClick={reject(item, "REJECTED", publishStatusUIText[uiTitle])}
      loading={
        !isEmpty(approveLoading) &&
        approveLoading?.button === action &&
        item?.id === approveLoading?.id &&
        item?.type === approveLoading?.type
      }
    >
      {publishStatusUIText[uiTitle]}
    </Button>
  );

  const renderNewApprovalRequests = () => {
    const filter =
      tab === "resources"
        ? "resources"
        : tab === "tags"
        ? "tags"
        : "stakeholders";
    const itemList =
      filter === "resources"
        ? resourcesData
        : filter === "stakeholders"
        ? stakeholdersData
        : [];
    const setItemList =
      filter === "resources"
        ? setResourcesData
        : filter === "stakeholders"
        ? setStakeholdersData
        : setResourcesData;
    const sectionTitle =
      filter === "resources"
        ? "New Resources"
        : filter === "tags"
        ? "New Tags"
        : "New Approval Request";

    const onChangePage = (current, pageSize) => {
      (async () => {
        const size = pageSize ? pageSize : itemList.limit;
        setItemList(
          await fetchSubmissionData(current, size, filter, "SUBMITTED")
        );
      })();
    };

    const RenderRow = ({ item }) => {
      const ResourceAvatar = () => (
        <div className="col content">
          <Avatar
            className="content-img"
            size={50}
            icon={item.picture || <UserOutlined />}
          />
          <div className="content-body">
            <div className="title">{item.title || "No Title"}</div>
            <div className="topic">{topicNames(item.type)}</div>
          </div>
        </div>
      );
      const ResourceSubmittedActions = () => (
        <div
          className="col action"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Space size="small">
            {item.type === "profile" ? (
              item.emailVerified ? (
                <PublishButton item={item} type="ghost" className="black" />
              ) : (
                <Tooltip title="Profile cannot be approved since email is not verified">
                  <PublishButton item={item} type="secondary" disabled={true} />
                </Tooltip>
              )
            ) : item.type === "policy" ? (
              <Tooltip title="Policies are imported from Law division system">
                <PublishButton item={item} type="secondary" disabled={true} />
              </Tooltip>
            ) : (
              <PublishButton item={item} type="ghost" className="black" />
            )}
            <UnpublishButton
              item={item}
              type="link"
              className="black"
              uiTitle="REJECT"
              action="REJECTED"
            />
          </Space>
        </div>
      );
      const ResourceApprovedActions = () => (
        <div
          className="col action"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Space size="small">
            <UnpublishButton
              item={item}
              type="ghost"
              className="black"
              uiTitle="UNAPPROVE"
              action="UNAPPROVED"
            />
          </Space>
        </div>
      );

      return (
        <div className="row">
          <ResourceAvatar />
          <div
            className="col reviewer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {tableFilter === "SUBMITTED" && <ReviewStatus item={item} />}
            {tableFilter === "APPROVED" && item.type === "stakeholder" && (
              <RoleSelect
                stakeholder={item}
                onChangeRole={changeRole}
                loading={loading}
              />
            )}
          </div>
          {tableFilter === "SUBMITTED" && <ResourceSubmittedActions />}
          {tableFilter === "APPROVED" && <ResourceApprovedActions />}
        </div>
      );
    };

    return (
      <div key="new-approval" className="approval">
        <h2>
          Showing {tableFilter.toLowerCase()} {tab} ({itemList.count || 0})
        </h2>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch />
            <HeaderFilter
              setTableFilter={setTableFilter}
              resources_or_stakeholders={filter}
              setResourcesData={setResourcesData}
              setStakeholdersData={setStakeholdersData}
            />
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
                      <RenderRow item={item} />
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
            onChange={onChangePage}
            current={itemList.page || 1}
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
        </TabPane>
        <TabPane tab="Resources" key="resources" className="profile-tab-pane">
          {renderNewApprovalRequests()}
        </TabPane>
        <TabPane tab="Tags" key="tags" className="profile-tab-pane">
          {renderNewApprovalRequests()}
        </TabPane>
      </Tabs>

      <ModalReject
        visible={modalRejectVisible}
        reject={modalRejectFunction}
        close={() => setModalRejectVisible(false)}
        action={modalRejectAction}
      />
    </div>
  );
};

export { AdminSection, HeaderSearch, HeaderFilter };
