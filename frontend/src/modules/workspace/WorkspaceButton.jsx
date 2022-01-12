import React, { useEffect, useState } from "react";
import {
  HomeOutlined,
  HeartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router";

const WorkspaceButton = () => {
  const [icon, setIcon] = useState(<HomeOutlined />);
  const history = useHistory().location.pathname;

  useEffect(() => {
    if (history.includes("bookmark")) {
      setIcon(<HeartOutlined />);
    }
    if (history.includes("admin")) {
      setIcon(<SettingOutlined />);
    }
    if (history === "/workspace") {
      setIcon(<HomeOutlined />);
    }
  }, []);

  console.log(history);

  return (
    <button className="btn-workspace">
      {icon}
      Workspace
    </button>
  );
};

export default WorkspaceButton;
