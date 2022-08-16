import { Link, withRouter } from 'react-router-dom';
import { Input, Button, Layout } from "antd";
import classNames from 'classnames'
import { ReactComponent as Dots3x3 } from "../../images/3x3.svg";
import { ReactComponent as AtlasSvg } from "../../images/book-atlas.svg";
import { ReactComponent as CaseStudiesSvg } from "../../images/capacity-building/ic-case-studies.svg";
import { ReactComponent as CapacityBuildingSvg } from "../../images/capacity-building/ic-capacity-building.svg";
import { ReactComponent as IconEvent } from "../../images/events/event-icon.svg";
import { ReactComponent as IconForum } from "../../images/events/forum-icon.svg";
import { ReactComponent as IconCommunity } from "../../images/events/community-icon.svg";
import { ReactComponent as IconPartner } from "../../images/stakeholder-overview/partner-icon.svg";
import { ReactComponent as ExpertIcon } from "../../images/stakeholder-overview/expert-icon.svg";

import logo from "../../images/gpml.svg";
import { useEffect, useRef, useState } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';

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
    if(e.key === 'Escape' && showMenu){
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
      {showMenu && (
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
            <Item title="Members" subtitle="Directory of GPML network entities and individuals" icon={<IconCommunity />} />
            <Item title="Experts" subtitle="Tool to find an expert and experts' groups" icon={<ExpertIcon />} />
            <Item title="Events" subtitle="Global events calendar" icon={<IconEvent />} />
            <Item title="Partners" subtitle="Directory of partners of the GPML Digital Platform" icon={<IconPartner />} />
          </div>
          <h5>Data hub</h5>
          <div className="row">
            <Item title="Analytics & statistics" subtitle="Metrics to measure progress" />
            <Item title="Data Catalog" subtitle="Datasets on plastic pollution and marine litter" />
            <Item title="Glossary" subtitle="Terminology and definitions" />
            <Item title="Story Telling" subtitle="Storytelling with custom maps" />
            <Item title="API explore" subtitle="Web services and APIs" />
          </div>
          <h5>Looking for more?</h5>
          <div className="row">
            <Item title="Help Center" subtitle="Support on GPML Digital Platform" />
            <Item title="About GPML" subtitle="Find out more about us" />
          </div>
        </div>
      )}
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
