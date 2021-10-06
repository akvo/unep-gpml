import React, { useState } from "react";
import { Select, Pagination, Avatar, notification } from "antd";
import api from "../../utils/api";
import { userRoles } from "../../utils/misc";
import { fetchStakeholders } from "./utils";
import { HeaderSearch } from "./admin";

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

const Stakeholder = ({ stakeholder, onChangeRole, loading }) => {
  const { firstName, lastName, title, email, picture } = stakeholder;
  return (
    <div className="row stakeholder-row">
      <div className="col content">
        <Avatar className="content-img" src={picture} size={50} />
        <div className="content-body">
          <div className="title">
            <span>{`${firstName} ${lastName}`}</span>{" "}
            <span className="status">{email}</span>
          </div>
          <div className="topic">Individual</div>
        </div>
      </div>
      <div className="col action">
        <RoleSelect
          stakeholder={stakeholder}
          onChangeRole={onChangeRole}
          loading={loading}
        />
      </div>
    </div>
  );
};

const ManageRoles = ({ stakeholdersData, setStakeholdersData }) => {
  const { stakeholders, page, limit, count } = stakeholdersData;
  const [loading, setLoading] = useState(false);

  const updateStakeholdersData = async (page, limit) => {
    setStakeholdersData(await fetchStakeholders(page, limit));
  };

  const onPageChange = (current, pageSize) => {
    const size = pageSize ? pageSize : limit;
    updateStakeholdersData(current, size);
  };

  // FIXME: Add Search
  const changeRole = (stakeholder, role) => {
    setLoading(stakeholder.id);
    api
      .patch(`/stakeholder/${stakeholder.id}`, { role })
      .then((resp) => {
        notification.success({ message: "User role changed" });
        // FIXME: Add error handling in case the PATCH fails!
        updateStakeholdersData(page, limit);
        setLoading(false);
      })
      .catch((err) => {
        notification.error({ message: "Something went wrong" });
      });
  };

  return (
    <div className="admin-view">
      <div key="manage-stakeholder" className="manage-stakeholder">
        <h2>Manage Stakeholder Roles</h2>
        <div className="table-wrapper stakeholder-wrapper">
          <div className="row head">
            <HeaderSearch placeholder="Search" />
          </div>
          {stakeholders?.map((stakeholder, index) => (
            <Stakeholder
              key={`manage-role-item-${index}`}
              stakeholder={stakeholder}
              onChangeRole={changeRole}
              loading={loading}
            />
          ))}
        </div>
      </div>
      <div className="pagination-wrapper with-notes">
        <small>* Only approved stakeholders are displayed here</small>
        <Pagination
          defaultCurrent={1}
          current={page}
          onChange={onPageChange}
          pageSize={limit}
          total={count}
          defaultPageSize={limit}
        />
      </div>
    </div>
  );
};

export default ManageRoles;
