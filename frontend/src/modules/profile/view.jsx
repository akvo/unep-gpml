import { store } from "../../store";
import { Button, notification, Tabs, Image, Menu, Divider } from "antd";
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  Fragment,
} from "react";
import api from "../../utils/api";
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

const ProfileView = ({ updateDisclaimer }) => {
  const globalState = useContext(store);
  const { dispatch } = globalState;
  const { tags, profile } = globalState.state;
  const handleSubmitRef = useRef();
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState("personal-details");
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    if (profile?.role === "ADMIN") {
      (async function fetchData() {
        const profileResp = await api.get("/profile/pending");
        const eventResp = await api.get("/event/pending");
        setPendingItems([
          ...profileResp.data.map((it) => ({
            type: "profile",
            title: `${it.firstName} ${it.lastName}`,
            ...it,
            offering:
              it.tags &&
              it.tags
                .filter((x) => x.category === "offering")
                .map((x) => x.tag),
            seeking:
              it.tags &&
              it.tags.filter((x) => x.category === "seeking").map((x) => x.tag),
            tags:
              it.tags &&
              it.tags.filter((x) => x.category === "general").map((x) => x.tag),
          })),
          ...eventResp.data.map((it) => ({ type: "event", ...it })),
        ]);
      })();
    }
  }, [profile]); // eslint-disable-next-line

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
        dispatch({ data: vals, type: "STORE PROFILE" });
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
              {it.key === "admin-section" && `(${pendingItems.length})`}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <RightOutlined />
            </div>
          </div>
        </Menu.Item>
      );
    });
  };

  useEffect(() => {
    updateDisclaimer(null);
  }, [updateDisclaimer]);

  return (
    <div id="profile">
      <div className="ui container">
        {isEmpty(profile) ? (
          <h2 className="loading">
            <LoadingOutlined spin /> Loading Profile
          </h2>
        ) : (
          <div className="menu-container">
            <div className="menu-wrapper">
              <div className="photo">
                <Image width="70%" src={profile.photo} />
              </div>
              <Menu
                defaultSelectedKeys={["personal-details"]}
                style={{ width: "100%", color: "#046799", fontWeight: "bold" }}
              >
                {renderMenuItem(profile)}
              </Menu>
            </div>
            <div className="content-wrapper">
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
                />
              )}
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
