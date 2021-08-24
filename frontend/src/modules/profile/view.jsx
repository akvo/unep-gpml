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
import {
  fetchArchiveData,
  fetchSubmissionData,
  fetchReviewItems,
} from "./utils";
import { userRoles as roles } from "../../utils/misc";
import SignupForm from "../signup/signup-form";
import AdminSection from "./admin";
import ReviewSection from "./review";
import "./styles.scss";
import isEmpty from "lodash/isEmpty";
import {
  LoadingOutlined,
  RightOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
const { TabPane } = Tabs;

const userRoles = new Set(roles);
const reviewerRoles = new Set(["REVIEWER", "ADMIN"]);
const adminRoles = new Set(["ADMIN"]);
const menuItems = [
  {
    key: "personal-details",
    name: "Personal Details",
    role: userRoles,
  },
  {
    key: "my-favourites",
    name: "My Favourites",
    role: userRoles,
  },
  {
    key: "my-network",
    name: "My Network",
    role: userRoles,
  },
  {
    key: "review-section",
    name: "Review Section",
    role: reviewerRoles,
  },
  {
    key: "admin-section",
    name: "Admin Section",
    role: adminRoles,
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
              {it.key === "review-section" && `(${reviewItems.count})`}
              {it.key === "admin-section" && `(${pendingItems.count})`}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <RightOutlined />
            </div>
          </div>
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
                  <Image width="70%" src={profilePic} />
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
  );
};

export default ProfileView;
