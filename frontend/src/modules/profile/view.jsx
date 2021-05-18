import { UIStore } from "../../store";
import {
  Button,
  notification,
  Tabs,
  Image,
  Menu,
  Dividerm,
  Row,
  Col,
} from "antd";
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  Fragment,
} from "react";
import StickyBox from "react-sticky-box";
import api from "../../utils/api";
import { fetchArchiveData } from "./utils";
import SignupForm from "../signup/signup-form";
import AdminSection from "./admin";
import "./styles.scss";
import isEmpty from "lodash/isEmpty";
import {
  LoadingOutlined,
  RightOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
const { TabPane } = Tabs;

const menuItems = [
  {
    key: "personal-details",
    name: "Personal Details",
    role: "user",
  },
  {
    key: "my-favourites",
    name: "My Favourites",
    role: "user",
  },
  {
    key: "my-network",
    name: "My Network",
    role: "user",
  },
  {
    key: "admin-section",
    name: "Admin Section",
    role: "admin",
  },
];

const ProfileView = ({ ...props }) => {
  const { countries, tags, profile } = UIStore.currentState;
  const handleSubmitRef = useRef();
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState("personal-details");
  const [pendingItems, setPendingItems] = useState({
    data: [],
    limit: 10,
    page: 0,
    count: 0,
    pages: 0,
  });
  const [archiveItems, setArchiveItems] = useState({
    data: [],
    limit: 10,
    page: 0,
    count: 0,
    pages: 0,
  });

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
    if (profile?.role === "ADMIN") {
      (async function fetchData() {
        const resp = await api.get("submission");
        setPendingItems(resp.data);
      })();
      (async function fetchData() {
        const archive = await fetchArchiveData(1, 10);
        setArchiveItems(archive);
      })();
    }
  }, [profile]);

  const onSubmit = (vals) => {
    if (!vals?.publicEmail) vals = { ...vals, publicEmail: false };
    setSaving(true);
    if (
      vals.geoCoverageType === "national" &&
      typeof vals.geoCoverageValue === "string"
    ) {
      vals.geoCoverageValue = [vals.geoCoverageValue];
    }
    if (vals.geoCoverageType === "global") {
      vals.geoCoverageValue = null;
    }
    api
      .put("/profile", vals)
      .then(() => {
        UIStore.update((e) => {
          e.profile = vals;
        });
        notification.success({ message: "Profile updated" });
        setSaving(false);
      })
      .catch(() => {
        notification.error({ message: "An error occured" });
        setSaving(false);
      });
  };

  const handleOnClickMenu = (params) => {
    setMenu(params);
  };

  const renderMenuItem = (profile) => {
    let menus = menuItems;
    if (profile?.role !== "ADMIN") {
      menus = menuItems.filter((it) => it.role === "user");
    }
    return menus.map((it) => {
      return (
        <Menu.Item key={it.key} onClick={() => handleOnClickMenu(it.key)}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {it.name}
              &nbsp;&nbsp;&nbsp;
              {it.key === "my-favourites" && <StarOutlined />}
              {it.key === "my-network" && <TeamOutlined />}
            </div>
            <div>
              {it.key === "my-favourites" && `(${0})`}
              {it.key === "my-network" && `(${0})`}
              {it.key === "admin-section" && `(${pendingItems.count})`}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <RightOutlined />
            </div>
          </div>
        </Menu.Item>
      );
    });
  };

  return (
    <div id="profile">
      <div className="ui container">
        {isEmpty(profile) ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading Profile
          </h2>
        ) : (
          <Row className="menu-container">
            <Col xs={24} md={8} lg={6} className="menu-wrapper">
              <StickyBox style={{ marginBottom: "3rem" }}>
                <div className="photo">
                  <Image width="70%" src={profile.photo} />
                </div>
                <Menu
                  defaultSelectedKeys={["personal-details"]}
                  style={{
                    width: "100%",
                    color: "#046799",
                    fontWeight: "bold",
                  }}
                >
                  {renderMenuItem(profile)}
                </Menu>
              </StickyBox>
            </Col>
            <Col xs={24} md={16} lg={18} className="content-wrapper">
              {menu === "personal-details" && (
                <div>
                  <SignupForm
                    onSubmit={onSubmit}
                    handleSubmitRef={(ref) => {
                      handleSubmitRef.current = ref;
                    }}
                    initialValues={profile}
                    isModal={false}
                  />
                  <Button
                    loading={saving}
                    type="primary"
                    onClick={(ev) => {
                      handleSubmitRef.current(ev);
                    }}
                  >
                    Update
                  </Button>
                </div>
              )}
              {menu === "admin-section" && profile?.role === "ADMIN" && (
                <AdminSection
                  pendingItems={pendingItems}
                  setPendingItems={setPendingItems}
                  archiveItems={archiveItems}
                  setArchiveItems={setArchiveItems}
                />
              )}
            </Col>
            {/* <Tabs tabPosition="left" className="fade-in">
              <TabPane tab="Personal details" key="1">
                <SignupForm
                  {...{ onSubmit, tags }}
                  handleSubmitRef={(ref) => {
                    handleSubmitRef.current = ref;
                  }}
                  initialValues={profile}
                />
                <Button
                  loading={saving}
                  type="primary"
                  onClick={(ev) => {
                    handleSubmitRef.current(ev);
                  }}
                >
                  Update
                </Button>
              </TabPane>
              {profile?.role === "ADMIN" && (
                <TabPane tab="Admin section" key="2">
                  <AdminSection />
                </TabPane>
              )}
            </Tabs> */}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
