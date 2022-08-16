import { Link, withRouter } from 'react-router-dom';
import { Input, Button, Layout } from "antd";
import classNames from 'classnames'
import { ReactComponent as Dots3x3 } from "../../images/3x3.svg";

import logo from "../../images/gpml.svg";
import { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';

const MenuBar = ({ updateQuery, isAuthenticated, logout, isRegistered, profile }) => {
  const domRef = useRef()
  useEffect(() => {
    const listen = (e) => {
      if(window.scrollY > 100 && domRef.current?.classList.contains('scrolled') === false){
        domRef.current?.classList.add('scrolled')
      } else if(window.scrollY < 100 && domRef.current?.classList.contains('scrolled')){
        domRef.current?.classList.remove('scrolled')
      }
    }
    document.addEventListener('scroll', listen)
    return () => {
      document.removeEventListener('scroll', listen)
    }
  }, [])
  return (
    <Layout.Header className="nav-header-container" ref={domRef}>
      <div className="ui container">
        <Link to="/">
          <img src={logo} className="logo" alt="GPML" />
        </Link>
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
