import React from "react";
import { withRouter } from "react-router";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import humps from "humps";
import { topicNames } from "../../utils/misc";
import sumBy from "lodash/sumBy";

const KnowledgeExchangeDropdownMenu = withRouter(({ history, resources }) => {
  const loading = !resources;
  const allResources = sumBy(resources, "count");
  return (
    <Dropdown
      overlayClassName="menu-dropdown-wrapper"
      overlay={
        <Menu className="menu-dropdown">
          <Menu.Item
            className="nav-link"
            onClick={() => history.push("/browse")}
          >
            All Resources
            <Button
              className="badge-count"
              size="small"
              type="ghost"
              shape="circle"
              icon={allResources}
              loading={loading}
            />
          </Menu.Item>
          {resources &&
            resources.map((x, i) => {
              const { name, count } = x;
              return (
                <Menu.Item
                  key={`${name}-${i}`}
                  className="indent-right nav-link"
                  disabled={loading}
                  onClick={() =>
                    history.push(`/browse?topic=${humps.decamelize(name)}`)
                  }
                >
                  {topicNames(name)}
                  <Button
                    className="badge-count"
                    size="small"
                    type="ghost"
                    shape="circle"
                    icon={count}
                    loading={loading}
                  />
                </Menu.Item>
              );
            })}
          {/* <Menu.Item className="nav-link">
            Capacity building
            <Button
              className="badge-count"
              size="small"
              type="ghost"
              shape="circle"
              icon={10}
              loading={false}
            />
          </Menu.Item> */}
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button type="link" className="menu-btn nav-link">
        Knowledge Exchange <DownOutlined />
      </Button>
    </Dropdown>
  );
});

export default KnowledgeExchangeDropdownMenu;
