import React from "react";
import { Input, Button, Layout, Menu, Dropdown } from "antd";
import Dots3x3 from "../../images/3x3.svg";
import AtlasSvg from "../../images/book-atlas.svg";
import CaseStudiesSvg from "../../images/capacity-building/ic-case-studies.svg";
import CapacityBuildingSvg from "../../images/capacity-building/ic-capacity-building.svg";
import IconEvent from "../../images/event-icon.svg";
import IconForum from "../../images/events/forum-icon.svg";
import IconCommunity from "../../images/events/community-icon.svg";
import IconPartner from "../../images/stakeholder-overview/partner-icon.svg";
import ExpertIcon from "../../images/stakeholder-overview/expert-icon.svg";
import AnalyticAndStatisticSvg from "../../images/analytic-and-statistic-icon.svg";
import DataCatalogueSvg from "../../images/data-catalogue-icon.svg";
import ExploreSvg from "../../images/explore-icon.svg";
import GlossarySvg from "../../images/glossary-icon.svg";
import MapSvg from "../../images/map-icon.svg";
import HelpCenterSvg from "../../images/help-center-icon.svg";
import AboutSvg from "../../images/about-icon.svg";
import { useEffect, useRef, useState } from "react";
import {
  CloseOutlined,
  HomeOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { CSSTransition } from "react-transition-group";
import bodyScrollLock from "../details-page/scroll-utils";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles.module.scss";
import { UIStore } from "../../store";

const MenuBar = ({
  updateQuery,
  isAuthenticated,
  setWarningModalVisible,
  isRegistered,
  profile,
  setLoginVisible,
  auth0Client,
  showMenu,
  setShowMenu,
}) => {
  const router = useRouter();
  const domRef = useRef();
  const { query } = router;
  useEffect(() => {
    const listen = (e) => {
      if (
        window.scrollY > 100 &&
        domRef.current?.classList.contains("scrolled") === false
      ) {
        domRef.current?.classList.add("scrolled");
      } else if (
        window.scrollY < 100 &&
        domRef.current?.classList.contains("scrolled")
      ) {
        domRef.current?.classList.remove("scrolled");
      }
    };
    document.addEventListener("scroll", listen);
    document.addEventListener("keyup", handleKeyPress);
    return () => {
      document.removeEventListener("scroll", listen);
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      setShowMenu(false);
      bodyScrollLock.disable();
    }
  };

  useEffect(() => {
    const param = query.ref;
    if (param && param === "all_tools" && router.pathname === "/") {
      setShowMenu(true);
      bodyScrollLock.enable();
    }
  }, [query, router.pathname]);

  const currentPath = router.asPath;

  return (
    <>
      <Layout.Header className="nav-header-container" ref={domRef}>
        <div className="ui container">
          <Link href="/" className="logo-a">
            <img src="/GPML-logo-alone.svg" className="logo" />
            <div className="beta">beta</div>
          </Link>
          {isAuthenticated && (
            <Link
              href="/workspace"
              className={`btn-workspace menu-btn  ${
                router.pathname === "/workspace" ? "selected" : ""
              }`}
              aria-label="Workspace"
            >
              <HomeOutlined />
              <span className="text">Workspace</span>
            </Link>
          )}
          <div
            className="all-tools-btn"
            onClick={() => {
              if (router.pathname === "/") router.push("/?ref=all_tools");
              else setShowMenu(true);
              bodyScrollLock.enable();
            }}
          >
            <Dots3x3 />
            <span>All Tools</span>
          </div>
          {Object.keys(pathContent).map((path) => (
            <React.Fragment key={path}>
              {currentPath === path && <Item to={path} />}
            </React.Fragment>
          ))}
          <div className="rightside">
            <Search router={router} />
            {!isAuthenticated ? (
              <Button type="ghost" onClick={() => setLoginVisible(true)}>
                Sign in
              </Button>
            ) : (
              [
                <AddButton
                  key="addButton"
                  {...{
                    isAuthenticated,
                    setLoginVisible,
                    router,
                    profile,
                    setWarningModalVisible,
                  }}
                />,
                <UserButton
                  key="userButton"
                  {...{ auth0Client, isRegistered, profile }}
                />,
              ]
            )}
          </div>
        </div>
      </Layout.Header>
      <CSSTransition
        in={showMenu}
        timeout={{
          appear: 800,
          enter: 800,
          exit: 200,
        }}
        unmountOnExit
        classNames={{
          enter: styles.fullMenuEnter,
          enterActive: styles.fullMenuEnterActive,
          exit: styles.fullMenuExit,
          exitActive: styles.fullMenuExitActive,
        }}
      >
        <div className={styles.fullMenu}>
          <div className={styles.contents}>
            <h2>All tools</h2>
            <div
              className={styles.closeBtn}
              onClick={() => {
                if (router.pathname === "/") {
                  router.push("/");
                }
                setShowMenu(false);
                bodyScrollLock.disable();
              }}
            >
              <CloseOutlined />
            </div>
            <h5>Information</h5>
            <div className={styles.row}>
              <Item to="/knowledge/library" {...{ setShowMenu }} />
              <Item to="/knowledge/case-studies" {...{ setShowMenu }} />
              <Item to="/knowledge/capacity-development" {...{ setShowMenu }} />
            </div>
            <h5>Community</h5>
            <div className={styles.row}>
              <Item to="/community" {...{ setShowMenu }} />
              <Item to="/experts" {...{ setShowMenu }} />
              <Item to="/events" {...{ setShowMenu }} />
              <Item to="/partners" {...{ setShowMenu }} />
              <Item
                href="https://communities.gpmarinelitter.org"
                title="Engage"
                subtitle="Interactive forum for collaboration"
                icon={<IconForum />}
              />
            </div>
            <h5>Data hub</h5>
            <div className={styles.row}>
              <Item
                href="https://datahub.gpmarinelitter.org"
                title="Analytics & statistics"
                subtitle="Metrics to measure progress"
                icon={<AnalyticAndStatisticSvg />}
                {...{ setShowMenu }}
              />
              <Item
                href="https://unepazecosysadlsstorage.z20.web.core.windows.net/"
                title="Data Catalogue"
                subtitle="Datasets on plastic pollution and marine litter"
                icon={<DataCatalogueSvg />}
                {...{ setShowMenu }}
              />
              <Item
                href="https://datahub.gpmarinelitter.org/pages/glossary/"
                title="Glossary"
                subtitle="Terminology and definitions"
                icon=<GlossarySvg />
                {...{ setShowMenu }}
              />
              <Item
                href="https://datahub.gpmarinelitter.org/pages/story_map"
                title="Story Maps"
                subtitle="Storytelling with custom maps"
                icon={<MapSvg />}
                {...{ setShowMenu }}
              />
              <Item
                href="https://datahub.gpmarinelitter.org/pages/api-explore"
                title="API explore"
                subtitle="Web services and APIs"
                icon={<ExploreSvg />}
                {...{ setShowMenu }}
              />
            </div>
            <h5>Looking for more?</h5>
            <div className={styles.row}>
              <Item to="/help-center" {...{ setShowMenu }} />
              <Item to="/about-us" {...{ setShowMenu }} />
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  );
};

const pathContent = {
  "/knowledge/library": {
    title: "Knowledge library",
    subtitle: "Resources on marine litter and plastic pollution",
    icon: <AtlasSvg />,
  },
  "/knowledge/case-studies": {
    title: "Case studies",
    icon: <CaseStudiesSvg />,
    subtitle: "Compilation of actions around the world",
    iconClass: "casestudies",
  },
  "/knowledge/capacity-development": {
    title: "Learning center",
    subtitle: "Learning and capacity development resources",
    icon: <CapacityBuildingSvg />,
    iconClass: "learning",
  },
  "/community": {
    title: "Members",
    iconClass: "tools-community-icon",
    subtitle: "Directory of GPML network entities and individuals",
    icon: <IconCommunity />,
  },
  "/experts": {
    title: "Experts",
    iconClass: "tools-experts-icon",
    subtitle: "Tool to find an expert and experts' groups",
    icon: <ExpertIcon />,
  },
  "/events": {
    title: "Events",
    subtitle: "Global events calendar",
    icon: <IconEvent />,
  },
  "/partners": {
    title: "Partners",
    iconClass: "tools-partners-icon",
    subtitle: "Directory of partners of the GPML Digital Platform",
    icon: <IconPartner />,
  },
  "/glossary": {
    title: "Glossary",
    subtitle: "Terminology and definitions",
    icon: <GlossarySvg />,
  },
  "/help-center": {
    title: "Help Center",
    subtitle: "Support on GPML Digital Platform",
    icon: <HelpCenterSvg />,
  },
  "/about-us": {
    title: "About GPML",
    subtitle: "Find out more about us",
    icon: <AboutSvg />,
  },
};

const Item = ({ title, subtitle, icon, iconClass, to, href, setShowMenu }) => {
  if (to != null && pathContent[to] != null) {
    iconClass = pathContent[to].iconClass;
    icon = pathContent[to].icon;
    title = pathContent[to].title;
    subtitle = pathContent[to].subtitle;
  }

  const contents = (
    <>
      <div className={["icon", iconClass].filter((it) => it != null).join(" ")}>
        {icon}
      </div>
      <div>
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  );
  const handleClick = () => {
    setShowMenu(false);
    bodyScrollLock.disable();
  };
  if (to != null) {
    return (
      <Link href={to} legacyBehavior>
        <a className={`${styles.menuItem} menu-item`} onClick={handleClick}>
          {contents}
        </a>
      </Link>
    );
  } else if (href != null) {
    return (
      <a
        className={`${styles.menuItem} menu-item`}
        href={href}
        onClick={handleClick}
      >
        {contents}
      </a>
    );
  }
  return <div className={`${styles.menuItem} menu-item`}>{contents}</div>;
};

const Search = ({ router }) => {
  const [search, setSearch] = useState("");

  const handleSearch = (src) => {
    if (src) {
      router.push({
        pathname: `/knowledge/library/grid`,
        query: { q: src.trim() },
      });
    } else {
      router.push({
        pathname: `/knowledge/library/grid`,
      });
    }
  };

  return (
    <div className="src">
      <Input
        value={search}
        className="input-src"
        placeholder="Search"
        suffix={<SearchOutlined />}
        onChange={(e) => setSearch(e.target.value)}
        onPressEnter={(e) => handleSearch(e.target.value)}
        onSubmit={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

const AddButton = ({
  isAuthenticated,
  setWarningModalVisible,
  router,
  setLoginVisible,
  profile,
}) => {
  const addContentClick = () => {
    router.push("/flexible-forms");
    UIStore.update((e) => {
      e.formEdit = {
        ...e.formEdit,
        flexible: {
          status: "add",
          id: null,
        },
      };
      e.formStep = {
        ...e.formStep,
        flexible: 1,
      };
    });
  };

  if (isAuthenticated) {
    if (profile?.reviewStatus === "APPROVED") {
      return (
        <>
          {/* <Link href="/flexible-forms"> */}
          <Button onClick={addContentClick} type="primary">
            Add Content
          </Button>
          {/* </Link> */}
        </>
      );
    }
    return (
      <Button
        type="primary"
        onClick={() => {
          profile?.reviewStatus === "SUBMITTED"
            ? setWarningModalVisible(true)
            : router.push({
                pathname: "/onboarding",
              });
        }}
      >
        Add Content
      </Button>
    );
  }
  return (
    <Button type="primary" onClick={() => setLoginVisible(true)}>
      Add Content
    </Button>
  );
};

const UserButton = ({ router, isRegistered, profile, auth0Client }) => {
  return (
    <Dropdown
      overlayClassName="user-btn-dropdown-wrapper"
      overlay={
        <Menu className="user-btn-dropdown">
          <Menu.Item
            key="profile"
            onClick={() => {
              router.push({
                pathname: `/${
                  isRegistered(profile) ? "profile" : "onboarding"
                }`,
              });
            }}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            key="logout"
            onClick={() => {
              auth0Client.logout({ returnTo: window.location.origin });
            }}
          >
            Logout
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="ghost"
        placement="bottomRight"
        className="profile-button"
        shape="circle"
        icon={<UserOutlined />}
      />
    </Dropdown>
  );
};

export default MenuBar;
