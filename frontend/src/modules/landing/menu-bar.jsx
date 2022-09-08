import { Link, withRouter } from 'react-router-dom';
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
import { CloseOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { CSSTransition } from 'react-transition-group';
import bodyScrollLock from "../details-page/scroll-utils";

const MenuBar = ({ updateQuery, isAuthenticated, logout, isRegistered, profile, setLoginVisible }) => {
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
          <Link to="/">
            <img src={logo} className="logo" alt="GPML" />
          </Link>
          <div className="all-tools-btn" onClick={() => {
            setShowMenu(true);
            bodyScrollLock.enable();
          }}>
            <Dots3x3 />
            <span>All Tools</span>
          </div>
          <div className="rightside">
            <Search updateQuery={updateQuery} />
            {!isAuthenticated ? (
              <Button type="ghost" onClick={() => setLoginVisible(true)}>Login</Button>
            ) : [
            <AddButton />, 
            <UserButton {...{ logout, isRegistered, profile }} />]
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
              <Item to="/knowledge/library" title="Knowledge library" subtitle="Resources on marine litter and plastic pollution" icon={<AtlasSvg />}   {...{ setShowMenu }} />
              <Item to="/knowledge/case-studies" icon={<CaseStudiesSvg />} iconClass="casestudies" title="Case studies" subtitle="Compilation of actions around the world"   {...{ setShowMenu }} />
              <Item to="/knowledge/capacity-building" title="Learning center" subtitle="Learning and capacity building resources" icon={<CapacityBuildingSvg />} iconClass="learning"   {...{ setShowMenu }} />
            </div>
            <h5>Community</h5>
            <div className="row">
              <Item to="/connect/community" title="Members" iconClass='tools-community-icon' subtitle="Directory of GPML network entities and individuals" icon={<IconCommunity />}   {...{ setShowMenu }} />
              <Item to="/connect/experts" title="Experts" iconClass='tools-experts-icon' subtitle="Tool to find an expert and experts' groups" icon={<ExpertIcon />}   {...{ setShowMenu }} />
              <Item to="/connect/events" title="Events" subtitle="Global events calendar" icon={<IconEvent />}   {...{ setShowMenu }} />
              <Item to="/connect/partners" title="Partners" iconClass='tools-partners-icon' subtitle="Directory of partners of the GPML Digital Platform" icon={<IconPartner />}   {...{ setShowMenu }} />
              <Item href="https://communities.gpmarinelitter.org" title="Engage" subtitle="Interactive forum for collaboration" icon={<IconForum />} />
            </div>
            <h5>Data hub</h5>
            <div className="row">
              <Item title="Analytics & statistics" subtitle="Metrics to measure progress" icon={<AnalyticAndStatisticSvg/>}  {...{ setShowMenu }} />
              <Item href="https://unepazecosysadlsstorage.z20.web.core.windows.net/" title="Data Catalog" subtitle="Datasets on plastic pollution and marine litter" icon={<DataCatalogueSvg/>}  {...{ setShowMenu }} />
              <Item to="/glossary" title="Glossary" subtitle="Terminology and definitions" icon={<GlossarySvg/>}  {...{ setShowMenu }} />
              <Item href="https://datahub.gpmarinelitter.org/" title="Story Telling" subtitle="Storytelling with custom maps" icon={<MapSvg/>}   {...{ setShowMenu }} />
              <Item href="https://datahub.gpmarinelitter.org/pages/api-explore" title="API explore" subtitle="Web services and APIs" icon={<ExploreSvg/>}  {...{ setShowMenu }} />
            </div>
            <h5>Looking for more?</h5>
            <div className="row">
              <Item to="/about-us" title="Help Center" subtitle="Support on GPML Digital Platform" icon={<HelpCenterSvg/>}  {...{ setShowMenu }} />
              <Item title="About GPML" subtitle="Find out more about us" icon={<AboutSvg/>}  {...{ setShowMenu }} />
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  )
}

const Item = ({ title, subtitle, icon, iconClass, to, href, setShowMenu }) => {
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
  }
  if(to != null){
    return <Link className="item" to={to} onClick={handleClick}>{contents}</Link>
  }
  else if(href != null){
    return <a className="item" href={href} onClick={handleClick}>{contents}</a>
  }
  return (
    <div className="item" onClick={handleClick}>
      {contents}
    </div>
  )
}


const Search = withRouter(({ history, updateQuery }) => {
  const [search, setSearch] = useState('');

  const handleSearch = (src) => {
    const path = history.location.pathname;
    if (src) {
      history.push(`/knowledge/library?q=${src.trim()}`);
      updateQuery("q", src.trim());
    } else {
      updateQuery("q", src.trim());
    }
  };

  return (
    <div className="src">
      <Input
        value={search}
        className="input-src"
        placeholder="Search"
        suffix={<SearchOutlined />}
        onPressEnter={(e) => handleSearch(e.target.value)}
        onSubmit={(e) => setSearch(e.target.value)}
      />
    </div>
  );
});

const UserButton = withRouter(({ history, logout, isRegistered, profile }) => {
  return (
    <Dropdown
      overlayClassName="user-btn-dropdown-wrapper"
      overlay={
        <Menu className="user-btn-dropdown">
          <Menu.Item
            onClick={() => {
              history.push(
                `/${isRegistered(profile) ? "profile" : "onboarding"}`
              );
            }}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              // auth0Client.logout({ returnTo: window.location.origin })
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
        className="left white"
        shape="circle"
        icon={<UserOutlined />}
      />
    </Dropdown>
  );
});

export default MenuBar
