import { UIStore } from "../../store";
import { Button, notification, Avatar, Menu, Row, Col } from "antd";
import React, { useRef, useState, useEffect } from "react";
import StickyBox from "react-sticky-box";
import api from "../../utils/api";

import SignupForm from "../old-signup/signup-form";
import {
  fetchArchiveData,
  fetchSubmissionData,
  fetchReviewItems,
  fetchStakeholders,
} from "./utils";
import { userRoles as roles } from "../../utils/misc";
import AdminSection from "./admin";
import ReviewSection from "./review";
import ManageRoles from "./stakeholders";
import "./styles.scss";
import isEmpty from "lodash/isEmpty";
import {
  LoadingOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  BookOutlined,
  UserSwitchOutlined,
  DiffOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const userRoles = new Set(roles);
const reviewerRoles = new Set(["REVIEWER", "ADMIN"]);
const adminRoles = new Set(["ADMIN"]);
const menuItems = [
  {
    key: "personal-details",
    name: "Personal Details",
    role: userRoles,
    icon: <UserOutlined />,
  },
  {
    key: "my-favourites",
    name: "My Favourites",
    role: userRoles,
    icon: <BookOutlined />,
  },
  {
    key: "my-network",
    name: "My Network",
    role: userRoles,
    icon: <UsergroupAddOutlined />,
  },
  {
    key: "manage-roles",
    name: "Manage User Roles",
    role: adminRoles,
    icon: <UserSwitchOutlined />,
  },
  {
    key: "review-section",
    name: "Review Section",
    role: reviewerRoles,
    icon: <DiffOutlined />,
  },
  {
    key: "admin-section",
    name: "Admin Section",
    role: adminRoles,
    icon: <SettingOutlined />,
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
    page: 1,
    count: 0,
    pages: 0,
  });
  const [archiveItems, setArchiveItems] = useState({
    data: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  });
  const [reviewItems, setReviewItems] = useState({
    reviews: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  });
  const [reviewedItems, setReviewedItems] = useState({
    reviews: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  });
  const [stakeholdersData, setStakeholdersData] = useState({
    stakeholders: [],
    limit: 10,
    page: 1,
    count: 0,
    pages: 0,
  });
  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = null;
    });
    if (adminRoles.has(profile?.role)) {
      (async () => {
        const { page, limit } = pendingItems;
        setPendingItems(await fetchSubmissionData(page, limit));
      })();
      (async function fetchData() {
        const archive = await fetchArchiveData(1, 10);
        setArchiveItems(archive);
      })();
      (async () => {
        const { page, limit } = stakeholdersData;
        const data = await fetchStakeholders(page, limit);
        setStakeholdersData(data);
      })();
    }
    if (reviewerRoles.has(profile?.role)) {
      (async () => {
        setReviewItems(await fetchReviewItems(reviewItems, "PENDING"));
      })();
      (async () => {
        setReviewedItems(
          await fetchReviewItems(reviewedItems, "ACCEPTED,REJECTED")
        );
      })();
    }
  }, [profile]);

  const onSubmit = (vals) => {
    setSaving(true);
    if (!vals?.publicEmail) {
      vals = { ...vals, publicEmail: false };
    }
    if (
      (vals.geoCoverageType === "national" ||
        vals.geoCoverageType === "sub-national") &&
      !Array.isArray(vals.geoCoverageValue)
    ) {
      vals.geoCoverageValue = [vals.geoCoverageValue];
    }
    if (vals.geoCoverageType === "global") {
      vals.geoCoverageValue = null;
    }
    if (
      vals?.org &&
      vals.org?.id === -1 &&
      (vals.org.geoCoverageType === "national" ||
        vals.org.geoCoverageType === "sub-national") &&
      !Array.isArray(vals.org.geoCoverageValue)
    ) {
      vals.org.geoCoverageValue = [vals.org.geoCoverageValue];
    }
    if (
      vals?.org &&
      vals.org?.id === -1 &&
      vals.org.geoCoverageType === "global"
    ) {
      vals.org.geoCoverageValue = null;
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
    const menus = menuItems.filter((it) => it.role.has(profile?.role));
    const renderMenuText = (name, count = false) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>{name}</span>
          {count !== false && (
            <Button
              style={{
                position: "absolute",
                right: "1rem",
              }}
              shape="circle"
              type="ghost"
              className="white"
              size="small"
            >
              {count}
            </Button>
          )}
        </div>
      );
    };
    return menus.map((it) => {
      let menuText = "";
      switch (it.key) {
        case "my-favourites":
          menuText = renderMenuText(it.name, 0);
          break;
        case "my-network":
          menuText = renderMenuText(it.name, 0);
          break;
        case "review-section":
          menuText = renderMenuText(it.name, reviewItems.count);
          break;
        case "admin-section":
          menuText = renderMenuText(it.name, pendingItems.count);
          break;
        default:
          menuText = renderMenuText(it.name);
          break;
      }
      return (
        <Menu.Item
          key={it.key}
          className="menu-item"
          icon={
            <Button
              type="ghost"
              className="white"
              shape="circle"
              icon={it.icon}
            />
          }
          onClick={() => handleOnClickMenu(it.key)}
        >
          {menuText}
        </Menu.Item>
      );
    });
  };

  const profilePic = profile?.photo?.includes("googleusercontent.com")
    ? profile?.photo.replace(
        /(s\d+\-c)/g,
        window.screen.width > 640 ? `s${window.screen.height}-c` : `s640-c`
      )
    : profile?.photo;
  return (
    <div id="profile">
      <div className="profile-container">
        <div className="ui container">
          {isEmpty(profile) ? (
            <h2 className="loading">
              <LoadingOutlined spin /> Loading Profile
            </h2>
          ) : (
            <Row className="menu-container profile-wrapper">
              <Col xs={24} sm={24} md={7} lg={6} className="menu-wrapper">
                <StickyBox
                  offsetTop={20}
                  offsetBottom={40}
                  style={{ marginBottom: "3rem" }}
                >
                  {menu === "personal-details" && (
                    <div className="photo">
                      <Avatar
                        src={profilePic}
                        size={{
                          xs: 24,
                          sm: 125,
                          md: 50,
                          lg: 64,
                          xl: 125,
                          xxl: 200,
                        }}
                      />
                    </div>
                  )}
                  <Menu
                    className="menu-content-wrapper"
                    defaultSelectedKeys={["personal-details"]}
                  >
                    {renderMenuItem(profile)}
                  </Menu>
                </StickyBox>
              </Col>
              <Col xs={24} sm={24} md={17} lg={18} className="content-wrapper">
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
                      type="ghost"
                      className="black"
                      onClick={(ev) => {
                        handleSubmitRef.current(ev);
                      }}
                    >
                      Update
                    </Button>
                  </div>
                )}
                {menu === "manage-roles" && adminRoles.has(profile?.role) && (
                  <ManageRoles
                    stakeholdersData={stakeholdersData}
                    setStakeholdersData={setStakeholdersData}
                  />
                )}
                {menu === "review-section" && adminRoles.has(profile?.role) && (
                  <ReviewSection
                    reviewItems={reviewItems}
                    setReviewItems={setReviewItems}
                    reviewedItems={reviewedItems}
                    setReviewedItems={setReviewedItems}
                  />
                )}
                {menu === "admin-section" && adminRoles.has(profile?.role) && (
                  <AdminSection
                    pendingItems={pendingItems}
                    setPendingItems={setPendingItems}
                    archiveItems={archiveItems}
                    setArchiveItems={setArchiveItems}
                  />
                )}
              </Col>
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
