import { Link, withRouter } from 'react-router-dom';
import { Input, Button, Layout } from "antd";
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
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { CSSTransition } from 'react-transition-group';

const MenuBar = ({ updateQuery, isAuthenticated, logout, isRegistered, profile }) => {
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
    }
  }
  return (
    <>
      <Layout.Header className="nav-header-container" ref={domRef}>
        <div className="ui container">
          <Link to="/">
            <img src={logo} className="logo" alt="GPML" />
          </Link>
          <div className="all-tools-btn" onClick={() => setShowMenu(true)}>
            <Dots3x3 />
            <span>All Tools</span>
          </div>
          <div className="rightside">
            <Search updateQuery={updateQuery} />
            {!isAuthenticated ? (
            <Button type="ghost">Login</Button>
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
          <h2>All tools</h2>
          <div className="close-btn" onClick={() => setShowMenu(false)}>
            <CloseOutlined />
          </div>
          <h5>Information</h5>
          <div className="row">
            <Item title="Knowledge library" subtitle="Resources on marine litter and plastic pollution" icon={<AtlasSvg />} />
            <Item icon={<CaseStudiesSvg />} iconClass="casestudies" title="Case studies" subtitle="Compilation of actions around the world" />
            <Item title="Learning center" subtitle="Learning and capacity building resources" icon={<CapacityBuildingSvg />} iconClass="learning" />
          </div>
          <h5>Community</h5>
          <div className="row">
            <Item title="Members" iconClass='tools-community-icon' subtitle="Directory of GPML network entities and individuals" icon={<IconCommunity />} />
            <Item title="Experts" iconClass='tools-experts-icon' subtitle="Tool to find an expert and experts' groups" icon={<ExpertIcon />} />
            <Item title="Events" iconClass='tools-events-icon' subtitle="Global events calendar" icon={<IconEvent />} />
            <Item title="Partners" iconClass='tools-partners-icon' subtitle="Directory of partners of the GPML Digital Platform" icon={<IconPartner />} />
          </div>
          <h5>Data hub</h5>
          <div className="row">
            <Item title="Analytics & statistics" subtitle="Metrics to measure progress" icon={<AnalyticAndStatisticSvg/>}/>
            <Item title="Data Catalog" subtitle="Datasets on plastic pollution and marine litter" icon={<DataCatalogueSvg/>}/>
            <Item title="Glossary" subtitle="Terminology and definitions" icon={<GlossarySvg/>}/>
            <Item title="Story Telling" subtitle="Storytelling with custom maps" icon={<MapSvg/>} />
            <Item title="API explore" subtitle="Web services and APIs" icon={<ExploreSvg/>}/>
          </div>
          <h5>Looking for more?</h5>
          <div className="row">
            <Item title="Help Center" subtitle="Support on GPML Digital Platform" icon={<HelpCenterSvg/>}/>
            <Item title="About GPML" subtitle="Find out more about us" icon={<AboutSvg/>}/>
          </div>
        </div>
      </CSSTransition>
    </>
  )
}

const Item = ({ title, subtitle, icon, iconClass}) => {
  return (
    <div className="item">
      <div className={['icon', iconClass].filter(it => it != null).join(' ')}>
        {icon}
      </div>
      <div>
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
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

export default MenuBar
