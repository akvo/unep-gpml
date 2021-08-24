import React from "react";
import { Select, Space, Pagination } from "antd";
import api from "../../utils/api";
import { userRoles } from "../../utils/misc";
import { fetchStakeholders } from "./utils";

const RoleSelect = ({ stakeholder, onChangeRole }) => {
  return (
    <Select
      showSearch={false}
      style={{ width: 150 }}
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
  const { firstName, lastName, title, email } = stakeholder;
  return (
    <div className="row stakeholder-row">
      <Space size="large">
        <div className="col">{`${firstName} ${lastName} (${email})`}</div>
        <div className="col">
          <RoleSelect stakeholder={stakeholder} onChangeRole={onChangeRole} />
        </div>
      </Space>
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
    <>
      <h2>Manage Stakeholder Roles</h2>
      {stakeholders?.map((stakeholder) => (
        <Stakeholder stakeholder={stakeholder} onChangeRole={changeRole} />
      ))}
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
    </>
  );
};

export default ManageRoles;
