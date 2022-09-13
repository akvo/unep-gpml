import { Link, NavLink, Route, Switch, withRouter } from 'react-router-dom';
import { Input, Button, Layout, Menu, Dropdown } from "antd";
import classNames from 'classnames'
import { ReactComponent as Dots3x3 } from "../../images/3x3.svg";
import { ReactComponent as AtlasSvg } from "../../images/book-atlas.svg";
import { ReactComponent as CaseStudiesSvg } from "../../images/capacity-building/ic-case-studies.svg";
import { ReactComponent as CapacityBuildingSvg } from "../../images/capacity-building/ic-capacity-building.svg";
import { ReactComponent as IconEvent } from "../../images/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";
import { ReactComponent as AnalyticAndStatisticSvg } from "../../images/analytic-and-statistic-icon.svg";
import { ReactComponent as DataCatalogueSvg } from "../../images/data-catalogue-icon.svg";
import { ReactComponent as ExploreSvg } from "../../images/explore-icon.svg";
import { ReactComponent as GlossarySvg } from "../../images/glossary-icon.svg";
import { ReactComponent as MapSvg } from "../../images/map-icon.svg";
import { ReactComponent as HelpCenterSvg } from "../../images/help-center-icon.svg";
import { ReactComponent as AboutSvg } from "../../images/about-icon.svg";

import logo from "../../images/gpml.svg";
import { useEffect, useRef, useState } from 'react';
import { CloseOutlined, HomeOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { CSSTransition } from 'react-transition-group';
import bodyScrollLock from "../details-page/scroll-utils";
import { UIStore } from "../../store.js";

const MenuBar = ({ updateQuery, isAuthenticated, setWarningModalVisible, isRegistered, profile, setLoginVisible, auth0Client }) => {
  const domRef = useRef()
  const [showMenu, setShowMenu] = useState(false)
  useEffect(() => {
    const listen = (e) => {
      if(window.scrollY > 100 && domRef.current?.classList.contains('scrolled') === false){
        domRef.current?.classList.add('scrolled')
      } else if(window.scrollY < 100 && domRef.current?.classList.contains('scrolled')){
        domRef.current?.classList.remove('scrolled')
      }
    }
    document.addEventListener('scroll', listen)
    document.addEventListener('keyup', handleKeyPress)
    return () => {
      document.removeEventListener('scroll', listen)
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [])
  const handleKeyPress = (e) => {
    if(e.key === 'Escape'){
      setShowMenu(false)
      bodyScrollLock.disable()
    }
  }
  return (
    <>
      <Layout.Header className="nav-header-container" ref={domRef}>
        <div className="ui container">
          <Link to="/" className="logo-a">
            <img src={logo} className="logo" alt="GPML" />
            <div className="beta">beta</div>
          </Link>
          {isAuthenticated && (
            <NavLink
              to="/workspace"
              className="btn-workspace menu-btn"
              activeClassName="selected"
              aria-label="Workspace"
            >
              <HomeOutlined />
              <span className="text">Workspace</span>
            </NavLink>
          )}
          <div className="all-tools-btn" onClick={() => {
            setShowMenu(true);
            bodyScrollLock.enable();
          }}>
            <Dots3x3 />
            <span>All Tools</span>
          </div>
          <Switch>
            {Object.keys(pathContent).map(path =>
              <Route path={path}>
                <Item to={path} />
              </Route>
            )}
          </Switch>
          <div className="rightside">
            <Search updateQuery={updateQuery} />
            {!isAuthenticated ? (
              <Button type="ghost" onClick={() => setLoginVisible(true)}>Sign in</Button>
            ) : [
            <AddButton {...{ isAuthenticated, setLoginVisible, history, profile, setWarningModalVisible }} />, 
            <UserButton {...{ auth0Client, isRegistered, profile }} />]
          }
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
        classNames="full-menu"
      >
        <div className="full-menu">
          <div className="contents">
            <h2>All tools</h2>
            <div className="close-btn" onClick={() => {
              setShowMenu(false)
              bodyScrollLock.disable()
            }}>
              <CloseOutlined />
            </div>
            <h5>Information</h5>
            <div className="row">
              <Item to="/knowledge/library" {...{ setShowMenu }} />
              <Item to="/knowledge/case-studies"  {...{ setShowMenu }} />
              <Item to="/knowledge/capacity-development"  {...{ setShowMenu }} />
            </div>
            <h5>Community</h5>
            <div className="row">
              <Item to="/connect/community" {...{ setShowMenu }} />
              <Item to="/connect/experts" {...{ setShowMenu }} />
              <Item to="/connect/events" {...{ setShowMenu }} />
              <Item to="/connect/partners" {...{ setShowMenu }} />
              <Item href="https://communities.gpmarinelitter.org" title="Engage" subtitle="Interactive forum for collaboration" icon={<IconForum />} />
            </div>
            <h5>Data hub</h5>
            <div className="row">
              <Item href="https://datahub.gpmarinelitter.org" title="Analytics & statistics" subtitle="Metrics to measure progress" icon={<AnalyticAndStatisticSvg/>}  {...{ setShowMenu }} />
              <Item href="https://unepazecosysadlsstorage.z20.web.core.windows.net/" title="Data Catalogue" subtitle="Datasets on plastic pollution and marine litter" icon={<DataCatalogueSvg/>}  {...{ setShowMenu }} />
              <Item to="/glossary"  {...{ setShowMenu }} />
              <Item href="https://datahub.gpmarinelitter.org/pages/story_map" title="Story Maps" subtitle="Storytelling with custom maps" icon={<MapSvg/>}   {...{ setShowMenu }} />
              <Item href="https://datahub.gpmarinelitter.org/pages/api-explore" title="API explore" subtitle="Web services and APIs" icon={<ExploreSvg/>}  {...{ setShowMenu }} />
            </div>
            <h5>Looking for more?</h5>
            <div className="row">
              <Item to="/help-center" {...{ setShowMenu }} />
              <Item to="/about-us" {...{ setShowMenu }} />
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  )
}

const pathContent = {
  '/knowledge/library': {
    title: 'Knowledge library', subtitle: 'Resources on marine litter and plastic pollution', icon: <AtlasSvg />
  },
  '/knowledge/case-studies': {
    title: 'Case studies', icon: <CaseStudiesSvg />, subtitle: 'Compilation of actions around the world', iconClass: 'casestudies'
  },
  '/knowledge/capacity-development': {
     title: "Learning center", subtitle: "Learning and capacity development resources", icon: <CapacityBuildingSvg />, iconClass: "learning" 
  },
  '/connect/community': {
     title: "Members", iconClass: 'tools-community-icon', subtitle: "Directory of GPML network entities and individuals", icon: <IconCommunity />
  },
  '/connect/experts': {
     title: "Experts", iconClass: 'tools-experts-icon', subtitle: "Tool to find an expert and experts' groups", icon: <ExpertIcon />
  },
  '/connect/events': {
     title: "Events", subtitle: "Global events calendar", icon: <IconEvent />
  },
  '/connect/partners': {
     title: "Partners", iconClass: 'tools-partners-icon', subtitle: "Directory of partners of the GPML Digital Platform", icon: <IconPartner />
  },
  '/glossary': {
     title: "Glossary", subtitle: "Terminology and definitions", icon: <GlossarySvg/>
  },
  '/help-center': {
     title: "Help Center", subtitle: "Support on GPML Digital Platform", icon: <HelpCenterSvg/>
  },
  '/about-us': {
     title: "About GPML", subtitle: "Find out more about us", icon: <AboutSvg/>
  }
}

const Item = ({ title, subtitle, icon, iconClass, to, href, setShowMenu }) => {
  if(to != null && pathContent[to] != null){
    iconClass = pathContent[to].iconClass
    icon = pathContent[to].icon
    title = pathContent[to].title
    subtitle = pathContent[to].subtitle
  }
  const contents = (
    <>
      <div className={['icon', iconClass].filter(it => it != null).join(' ')}>
        {icon}
      </div>
      <div>
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
    </>
  )
  const handleClick = () => {
    setShowMenu(false)
    bodyScrollLock.disable()
  }
  if(to != null){
    return <Link className="menu-item" to={to} onClick={handleClick}>{contents}</Link>
  }
  else if(href != null){
    return <a className="menu-item" href={href} onClick={handleClick}>{contents}</a>
  }
  return (
    <div className="menu-item">
      {contents}
    </div>
  )
}


const Search = withRouter(({ history, updateQuery }) => {
  const [search, setSearch] = useState('');

  const handleSearch = (src) => {
    const path = history.location.pathname;
    if (src) {
      history.push(`/knowledge/library/resource/category?q=${src.trim()}`);
    } else {
      history.push(`/knowledge/library/resource/category`);
    }
  };

  return (
    <div className="src">
      <Input
        className="input-src"
        placeholder="Search"
        suffix={<SearchOutlined />}
        onPressEnter={(e) => handleSearch(e.target.value)}
        onSubmit={(e) => setSearch(e.target.value)}
      />
    </div>
  );
});

const AddButton = withRouter(
  ({
    isAuthenticated,
    setWarningModalVisible,
    history,
    setLoginVisible,
    profile
  }) => {
    if (isAuthenticated) {
      if (profile?.reviewStatus === "APPROVED") {
        return (
          <>
            <Link to="/flexible-forms">
              <Button type="primary">Add Content</Button>
            </Link>
          </>
        );
      }
      return (
        <Button
          type="primary"
          onClick={() => {
            profile?.reviewStatus === "SUBMITTED"
              ? setWarningModalVisible(true)
              : history.push("/onboarding");
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
  }
);

const UserButton = withRouter(({ history, isRegistered, profile, auth0Client }) => {
  return (
    <Dropdown
      overlayClassName="user-btn-dropdown-wrapper"
      overlay={
        <Menu className="user-btn-dropdown">
          <Menu.Item
            key="profile"
            onClick={() => {
              history.push(
                `/${isRegistered(profile) ? "profile" : "onboarding"}`
              );
            }}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            key="logout"
            onClick={() => {
              auth0Client.logout({ returnTo: window.location.origin })
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
});

export default MenuBar
