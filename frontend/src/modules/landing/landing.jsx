import React, { useState } from 'react'
import { Input, Button, Menu, Dropdown, Layout } from "antd";
import logo from "../../images/gpml.svg";
import './styles.scss'
import { Link, withRouter } from 'react-router-dom';
import { ReactComponent as Dots3x3 } from "../../images/3x3.svg";
import { ReactComponent as Down } from "../../images/down.svg";
import { ReactComponent as PlasticLitter } from "../../images/plastic-litter.svg";
import { ArrowDownOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';

const Landing = ({ isAuthenticated, updateQuery, profile, isRegistered, logout}) => {
  return (
    <div id="landing">
      <Layout.Header className="nav-header-container">
        <div className="ui container">
          <Link to="/">
            <img src={logo} className="logo" alt="GPML" />
          </Link>
          {/* <div className="all-tools-btn"></div> */}
          <div className="all-tools-btn">
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
      <div className="hero">
        <div className="litter">
          <PlasticLitter />
        </div>
        <div className="content">
          <h1>The Digital Platform on Plastic Pollution & Marine Litter</h1>
          <h4>Informing and connecting all actors working to prevent marine litter and plastic pollution.</h4>
          <Button type="primary" size='large'>Join the Partnership</Button>
        </div>
        <div className="next-btn">
          <Down />
        </div>
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

export default Landing
