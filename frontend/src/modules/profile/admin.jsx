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
import invert from "lodash/invert";
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

const HeaderSearch = ({ placeholder, listOpts, setListOpts }) => {
  return (
    <Search
      className="search"
      placeholder={placeholder ? placeholder : "Search for a resource"}
      allowClear
      onChange={(x) => {
        if (x.target.value === "") {
          (async () => {
            const data = await fetchSubmissionData(
              1,
              10,
              listOpts.type,
              listOpts.reviewStatus
            );
            setListOpts((opts) => ({ ...opts, data }));
          })();
        }
      }}
      onSearch={(x) => {
        console.log("search", x, listOpts.type, listOpts.reviewStatus);
        (async () => {
          const data = await fetchSubmissionData(
            1,
            10,
            listOpts.type,
            listOpts.reviewStatus,
            x
          );
          setListOpts((opts) => ({ ...opts, data }));
        })();
      }}
    />
  );
};
const reviewStatusOrderedList = ["Approved", "Pending", "Declined"];
const statusDictToHuman = {
  APPROVED: "Approved",
  SUBMITTED: "Pending",
  REJECTED: "Declined",
};
const statusDictToAPI = invert(statusDictToHuman);

const HeaderFilter = ({
  listOpts,
  reviewers,
  setListOpts,
  initialReviewStatus,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    (listOpts.reviewStatus && statusDictToHuman(listOpts.reviewStatus)) ||
      initialReviewStatus
  );
  return (
    <Select
      showSearch
      allowClear
      className="filter-by-status"
      value={selectedValue}
      onChange={(x) => {
        setSelectedValue(x);
        console.log(listOpts.type, x);
        if (typeof x === "undefined") {
          (async () => {
            const data = await fetchSubmissionData(1, 10, listOpts.type);
            setListOpts((opts) => ({ ...opts, reviewStatus: null, data }));
          })();
        } else {
          const reviewStatus = statusDictToAPI[x];
          setListOpts((opts) => ({ ...opts, reviewStatus }));
          console.log(reviewStatus);
          (async () => {
            const data = await fetchSubmissionData(
              1,
              10,
              listOpts.type,
              reviewStatus
            );
            setListOpts((opts) => ({ ...opts, reviewStatus, data }));
          })();
        }
      }}
      optionLabelProp="label"
      placeholder={
        <>
          <FilterOutlined className="filter-icon" /> Filter by review status
        </>
      }
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {reviewStatusOrderedList.map((x, i) => (
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
    <div
      className="col reviewer"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
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
    </div>
  );
};

const OwnerSelect = ({ resource, onChangeOwner, loading, reviewers }) => {
  return (
    <Select
      showSearch={false}
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Assign owner"
      onChange={(data) => onChangeOwner(resource, data)} // onChangeOwner(resource, role)}
      value={resource?.owners}
      loading={resource?.id === loading}
      // FIXME: Disallow changing roles of other admins?
      // stakeholder?.role === "ADMIN"
      disabled={resource?.id === loading}
    >
      {reviewers.map((r) => (
        <Select.Option key={r.email} value={r.id}>
          {r.email}
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
  // TODO:: refactor modalRejectAction and modalRejectFunction
  const [modalRejectAction, setModalRejectAction] = useState("decline");
  const [modalRejectFunction, setModalRejectFunction] = useState(false);

  //TODO :: improve detail preview
  const [previewContent, storePreviewContent] = useState({});

  const [approveLoading, setApproveLoading] = useState({});
  const [loadingAssignReviewer, setLoadingAssignReviewer] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState("stakeholders-entities");
  const [stakeholdersListOpts, setStakeholdersListOpts] = useState({
    titleFilter: null,
    reviewStatus: null,
    data: stakeholdersData,
    type: "stakeholders",
  });
  const [resourcesListOpts, setResourcesListOpts] = useState({
    titleFilter: null,
    reviewStatus: null,
    data: resourcesData,
    type: "resources",
  });
  const [tagsListOpts, setTagsListOpts] = useState({
    titleFilter: null,
    reviewStatus: null,
    data: null,
    type: "tags",
  });

  const [reviewers, setReviewers] = useState([]);
  useEffect(() => {
    api.get("/reviewer").then((res) => {
      setReviewers(res.data);
    });
  }, []);

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

  const changeOwner = (resource, owners) => {
    setLoading(resource.id);
    const stakeholders = owners.map((x) => ({ id: x, roles: ["owner"] }));
    api
      .post(`/auth/${resource.type}/${resource.id}`, { stakeholders })
      .then((resp) => {
        notification.success({ message: "Ownerships changed" });
        setLoading(false);
      })
      .then(() => fetchSubmissionData(1, 10, "resources", "APPROVED"))
      .then((x) => setResourcesData(x))
      .catch((err) => {
        notification.error({ message: "Something went wrong" });
      });
  };

  const review = (item, reviewStatus) => () => {
    setApproveLoading({ ...item, button: reviewStatus });
    const itemType =
      item.type === "project"
        ? "initiative"
        : resourceTypeToTopicType(item.type);
    api
      .put("submission", {
        id: item.id,
        itemType: itemType,
        reviewStatus: reviewStatus,
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

  const reject = (item, reviewStatus, action) => () => {
    setModalRejectFunction(() => review(item, reviewStatus));
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
      <div
        className="col reviewer"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
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
      </div>
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

  const renderList = (listOpts, setListOpts) => {
    const itemList = listOpts.data || [];

    const onChangePage = (current, pageSize) => {
      (async () => {
        const size = pageSize ? pageSize : itemList.limit;
        const data = await fetchSubmissionData(
          current,
          size,
          listOpts.type,
          listOpts.reviewStatus
        );
        setListOpts((opts) => ({ ...opts, data }));
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
      //      console.log(item);
      return (
        <div className="row">
          <ResourceAvatar />
          {item.reviewStatus === "SUBMITTED" && <ReviewStatus item={item} />}
          {item.reviewStatus === "APPROVED" && item.type === "stakeholder" && (
            <RoleSelect
              stakeholder={item}
              onChangeRole={changeRole}
              loading={loading}
            />
          )}
          {item.reviewStatus === "APPROVED" && (
            <OwnerSelect
              reviewers={reviewers}
              resource={item}
              onChangeOwner={changeOwner}
              loading={loading}
            />
          )}
          {item.reviewStatus === "SUBMITTED" && <ResourceSubmittedActions />}
          {item.reviewStatus === "APPROVED" && <ResourceApprovedActions />}
        </div>
      );
    };

    return (
      <div key="new-approval" className="approval">
        {listOpts.reviewStatus && (
          <h3>Filtering by: {listOpts.reviewStatus?.toLowerCase()}</h3>
        )}
        <h4>Total: {itemList.count || 0}</h4>
        <div className="table-wrapper">
          <div className="row head">
            <HeaderSearch setListOpts={setListOpts} listOpts={listOpts} />
            <HeaderFilter
              setListOpts={setListOpts}
              listOpts={listOpts}
              initialReviewStatus="Pending"
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
          {renderList(stakeholdersListOpts, setStakeholdersListOpts)}
        </TabPane>
        <TabPane tab="Resources" key="resources" className="profile-tab-pane">
          {renderList(resourcesListOpts, setResourcesListOpts)}
        </TabPane>
        <TabPane tab="Tags" key="tags" className="profile-tab-pane">
          {renderList(tagsListOpts, setTagsListOpts)}
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
