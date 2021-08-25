import React from "react";
import { Select, Pagination, Avatar } from "antd";
import api from "../../utils/api";
import { userRoles } from "../../utils/misc";
import { fetchStakeholders } from "./utils";

const RoleSelect = ({ stakeholder, onChangeRole }) => {
  return (
    <Select
      showSearch={false}
      style={{ width: "100%" }}
      onChange={(role) => onChangeRole(stakeholder, role)}
      defaultValue={stakeholder?.role}
      // FIXME: Disallow changing roles of other admins?
      // disabled={stakeholder?.role === "ADMIN"}
    >
      {userRoles.map((r) => (
        <Select.Option key={r} value={r}>
          {r}
        </Select.Option>
      ))}
    </Select>
  );
};

const Stakeholder = ({ stakeholder, onChangeRole }) => {
  const { firstName, lastName, title, email, picture } = stakeholder;
  return (
    <div className="row stakeholder-row">
      <div className="col content">
        <div>
          <Avatar
            src={picture}
            size={{ xs: 24, sm: 32, md: 40, lg: 50, xl: 50, xxl: 50 }}
          />
        </div>
        <div>
          <div className="title">
            {`${firstName} ${lastName}`} <span className="status">{email}</span>
          </div>
          <div className="topic">Stakeholder</div>
        </div>
      </div>
      <div className="col action">
        <RoleSelect stakeholder={stakeholder} onChangeRole={onChangeRole} />
      </div>
    </div>
  );
};

const ManageRoles = ({ stakeholdersData, setStakeholdersData }) => {
  const { stakeholders, page, limit, count } = stakeholdersData;

  const updateStakeholdersData = async (page, limit) => {
    setStakeholdersData(await fetchStakeholders(page, limit));
  };

  const onPageChange = (page) => {
    updateStakeholdersData(page, limit);
  };

  // FIXME: Add Search
  const changeRole = (stakeholder, role) => {
    api.patch(`/stakeholder/${stakeholder.id}`, { role }).then((resp) => {
      // FIXME: Add error handling in case the PATCH fails!
      updateStakeholdersData(page, limit);
    });
  };

  return (
    <div className="admin-view">
      <div key="manage-stakeholder" className="manage-stakeholder">
        <h2>Manage Stakeholder Roles</h2>
        <div className="table-wrapper stakeholder-wrapper">
          {stakeholders?.map((stakeholder) => (
            <Stakeholder stakeholder={stakeholder} onChangeRole={changeRole} />
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 0px" }}>
        <Pagination
          defaultCurrent={1}
          current={page}
          onChange={onPageChange}
          pageSize={limit}
          total={count}
          defaultPageSize={limit}
        />
      </div>
      <small>* Only approved stakeholders are displayed here</small>
    </div>
  );
};

export default ManageRoles;
