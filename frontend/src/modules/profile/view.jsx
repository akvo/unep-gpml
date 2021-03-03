import { Button, notification, Tabs, Image, Menu, Divider } from "antd";
import React, { useRef, useState, useEffect, Fragment } from "react";
import api from "../../utils/api";
import SignupForm from "../signup/signup-form";
import AdminSection from "./admin";
import "./styles.scss";
import isEmpty from "lodash/isEmpty";
import { LoadingOutlined, RightOutlined } from "@ant-design/icons";
const { TabPane } = Tabs;

const ProfileView = ({
  profile,
  tags,
  setProfile,
  countries,
  updateDisclaimer,
}) => {
  const handleSubmitRef = useRef();
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState("personal-details");
  const onSubmit = (vals) => {
    setSaving(true);
    if (
      vals.geoCoverageType === "national" &&
      typeof vals.geoCoverageValue === "string"
    ) {
      vals.geoCoverageValue = [vals.geoCoverageValue];
    }
    api
      .put("/profile", vals)
      .then(() => {
        setProfile(vals);
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

  useEffect(() => {
    updateDisclaimer(null);
  }, []);

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
                style={{ width: "100%", color: "#046799", fontWeight: "bold" }}
              >
                <Menu.Item
                  onClick={() => handleOnClickMenu("personal-details")}
                >
                  Personal Details
                </Menu.Item>
                <Menu.Item>My Favourites</Menu.Item>
                <Menu.Item>My Network</Menu.Item>
                {profile?.role === "ADMIN" && (
                  <Menu.Item onClick={() => handleOnClickMenu("admin-section")}>
                    Admin Section
                  </Menu.Item>
                )}
              </Menu>
            </div>
            <div className="content-wrapper">
              {menu === "personal-details" && (
                <div>
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
                </div>
              )}
              {menu === "admin-section" && profile?.role === "ADMIN" && (
                <AdminSection countries={countries} />
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
