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
      onSearch={(title) => {
        (async () => {
          const data = await fetchSubmissionData(
            1,
            10,
            listOpts.type,
            listOpts.reviewStatus,
            title
          );
          setListOpts((opts) => ({
            ...opts,
            data,
            title,
            size: 10,
            current: 1,
          }));
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
    (listOpts.reviewStatus && statusDictToHuman[listOpts.reviewStatus]) ||
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
            const data = await fetchSubmissionData(
              1,
              10,
              listOpts.type,
              listOpts.title
            );
            setListOpts((opts) => ({
              ...opts,
              reviewStatus: null,
              data,
              size: 10,
              current: 1,
            }));
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
              reviewStatus,
              listOpts.title
            );
            setListOpts((opts) => ({
              ...opts,
              reviewStatus,
              data,
              current: 1,
              size: 10,
            }));
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

const RoleSelect = ({
  stakeholder,
  onChangeRole,
  loading,
  listOpts,
  setListOpts,
}) => {
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
        onChange={(role) =>
          onChangeRole(stakeholder, role, listOpts, setListOpts)
        }
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

const OwnerSelect = ({
  item,
  onChangeOwner,
  loading,
  reviewers,
  listOpts,
  setListOpts,
}) => {
  return (
    <div
      style={{ width: "50%" }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div>Owners</div>
      <Select
        style={{ width: "100%" }}
        showSearch={false}
        mode="multiple"
        placeholder="Assign owner"
        onChange={(data) => onChangeOwner(item, data, listOpts, setListOpts)} // onChangeOwner(resource, role)}
        value={item?.owners}
        loading={item?.id === loading}
        // FIXME: Disallow changing roles of other admins?
        // stakeholder?.role === "ADMIN"
        disabled={item?.id === loading}
      >
        {reviewers.map((r) => (
          <Select.Option key={r.email} value={r.id}>
            {r.email}
          </Select.Option>
        ))}
      </Select>
    </div>
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
    reviewStatus: "SUBMITTED",
    data: stakeholdersData,
    type: "stakeholders",
    current: 1,
    size: 10,
  });
  const [resourcesListOpts, setResourcesListOpts] = useState({
    titleFilter: null,
    reviewStatus: "SUBMITTED",
    data: resourcesData,
    type: "resources",
    current: 1,
    size: 10,
  });

  const [reviewers, setReviewers] = useState([]);
  useEffect(() => {
    api.get("/reviewer").then((res) => {
      setReviewers(res.data);
    });
  }, []);

  const changeRole = (stakeholder, role, listOpts, setListOpts) => {
    setLoading(stakeholder.id);
    api
      .patch(`/stakeholder/${stakeholder.id}`, { role })
      .then((resp) => {
        notification.success({ message: "User role changed" });
        // FIXME: Add error handling in case the PATCH fails!
        setLoading(false);
      })
      .then(() =>
        fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
      )
      .then((data) => setListOpts((opts) => ({ ...opts, data })))
      .catch((err) => {
        notification.error({ message: "Something went wrong" });
      });
  };

  const changeOwner = (item, owners, listOpts, setListOpts) => {
    setLoading(item.id);
    const stakeholders = owners.map((x) => ({ id: x, roles: ["owner"] }));
    api
      .post(`/auth/${item.type}/${item.id}`, { stakeholders })
      .then((resp) => {
        notification.success({ message: "Ownerships changed" });
        setLoading(false);
      })
      .then(() =>
        fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        )
      )
      .then((data) => setListOpts((opts) => ({ ...opts, data })))
      .catch((err) => {
        notification.error({ message: "Something went wrong" });
      });
  };

  const review = (item, reviewStatus, listOpts, setListOpts) => () => {
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
        (async () => {
          const data = await fetchSubmissionData(
            listOpts.current,
            listOpts.size,
            listOpts.type,
            listOpts.reviewStatus,
            listOpts.title
          );
          setListOpts((opts) => ({ ...opts, data }));
          setApproveLoading({});
        })();
        setModalRejectVisible(false);
      });
  };

  const reject = (item, reviewStatus, action, listOpts, setListOpts) => () => {
    setModalRejectFunction(() =>
      review(item, reviewStatus, listOpts, setListOpts)
    );
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

  const assignReviewer = (item, reviewer, listOpts, setListOpts) => {
    setLoadingAssignReviewer(item);
    const data = { reviewer: reviewer };
    const apiCall = item?.reviewer?.id ? api.patch : api.post;
    apiCall(`/review/${item.type}/${item.id}`, data).then((res) => {
      setLoadingAssignReviewer(false);
      (async () => {
        const data = await fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        );
        setListOpts((opts) => ({ ...opts, data }));
      })();
    });
  };

  const ReviewStatus = ({ item, listOpts, setListOpts }) => {
    return (
      <div
        className="col reviewer"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Select
          //          mode="multiple"
          showSearch={true}
          className="select-reviewer"
          placeholder="Assign reviewer"
          onChange={(reviewerId) =>
            assignReviewer(item, reviewerId, listOpts, setListOpts)
          }
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

  const PublishButton = ({
    item,
    type,
    className = "",
    disabled = false,
    listOpts,
    setListOpts,
  }) => (
    <Button
      type={type}
      className={className}
      disabled={disabled}
      onClick={review(item, "APPROVED", listOpts, setListOpts)}
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
    listOpts,
    setListOpts,
  }) => (
    <Button
      type={type}
      className={className}
      disabled={disabled}
      onClick={reject(
        item,
        "REJECTED",
        publishStatusUIText[uiTitle],
        listOpts,
        setListOpts
      )}
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
        setListOpts((opts) => ({ ...opts, size, current }));
        const data = await fetchSubmissionData(
          listOpts.current,
          listOpts.size,
          listOpts.type,
          listOpts.reviewStatus,
          listOpts.title
        );
        setListOpts((opts) => ({ ...opts, data }));
      })();
    };

    const RenderRow = ({ item, setListOpts, listOpts }) => {
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
                <PublishButton
                  item={item}
                  type="ghost"
                  className="black"
                  listOpts={listOpts}
                  setListOpts={setListOpts}
                />
              ) : (
                <Tooltip title="Profile cannot be approved since email is not verified">
                  <PublishButton
                    item={item}
                    type="secondary"
                    disabled={true}
                    listOpts={listOpts}
                    setListOpts={setListOpts}
                  />
                </Tooltip>
              )
            ) : item.type === "policy" ? (
              <Tooltip title="Policies are imported from Law division system">
                <PublishButton
                  item={item}
                  type="secondary"
                  disabled={true}
                  listOpts={listOpts}
                  setListOpts={setListOpts}
                />
              </Tooltip>
            ) : (
              <PublishButton
                item={item}
                type="ghost"
                className="black"
                listOpts={listOpts}
                setListOpts={setListOpts}
              />
            )}
            <UnpublishButton
              item={item}
              type="link"
              className="black"
              uiTitle="REJECT"
              action="REJECTED"
              listOpts={listOpts}
              setListOpts={setListOpts}
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
              listOpts={listOpts}
              setListOpts={setListOpts}
            />
          </Space>
        </div>
      );
      //      console.log(item);
      return (
        <div className="row">
          <ResourceAvatar />
          {item.reviewStatus === "SUBMITTED" && (
            <ReviewStatus
              item={item}
              listOpts={listOpts}
              setListOpts={setListOpts}
            />
          )}
          {item.reviewStatus === "APPROVED" && item.type === "stakeholder" && (
            <RoleSelect
              stakeholder={item}
              onChangeRole={changeRole}
              loading={loading}
              listOpts={listOpts}
              setListOpts={setListOpts}
            />
          )}
          {item.reviewStatus === "APPROVED" && (
            <OwnerSelect
              item={item}
              reviewers={reviewers}
              setListOpts={setListOpts}
              listOpts={listOpts}
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
        <div>
          <b>Total:</b> {itemList.count || 0}
        </div>
        {(listOpts.reviewStatus || listOpts.title) && (
          <div>
            <div>
              <b>Filtering by:</b>
              <hr />
            </div>
            {listOpts.reviewStatus && (
              <div>
                <b>Review status:</b> {statusDictToHuman[listOpts.reviewStatus]}
              </div>
            )}
            {listOpts.title && (
              <div>
                <b>Title:</b> {listOpts.title}
              </div>
            )}
          </div>
        )}
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
                      <RenderRow
                        item={item}
                        listOpts={listOpts}
                        setListOpts={setListOpts}
                      />
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
              />
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
