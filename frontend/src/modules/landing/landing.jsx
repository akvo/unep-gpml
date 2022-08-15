import React, { useState } from 'react'
import { Input, Button, Menu, Dropdown, Layout } from "antd";
import logo from "../../images/gpml.svg";
import './styles.scss'
import { Link, withRouter } from 'react-router-dom';
import { ReactComponent as Dots3x3 } from "../../images/3x3.svg";
import { SearchOutlined } from '@ant-design/icons';

const Landing = ({ isAuthenticated, updateQuery, profile, isRegistered, logout}) => {
  return (
    <div>
    <div className="landing">
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
