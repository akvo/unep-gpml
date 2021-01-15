import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { Input, Button } from 'antd'
import { SearchOutlined, PlusOutlined, DownOutlined, CaretDownOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css';
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import logo from './images/GPML-logo.svg'
import Signup from './modules/signup/view';
import axios from 'axios';

const Root = () => {
    const { isAuthenticated,
        isLoading,
        getIdTokenClaims,
        loginWithRedirect,
        logout,
    } = useAuth0();
    const [claims, setClaims] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const theTokens = await getIdTokenClaims();
            setClaims(theTokens);
            if (theTokens) {
                const profile = await axios.get("/api/profile", {headers: {
                    Authorization: `Bearer ${theTokens._raw}`
                }});
            }
            return true;
        }
        fetchData();
    });

    if (isLoading) {
        return <div>Loading</div>
    }

    const checkStatus = () => {
        console.log(Date(claims.exp));
        console.log(claims);
    }

    console.log(claims);

    return (
    <Router>
      <div id="root">
        <div className="topbar">
          <div className="ui container">
            <div className="leftside">
            <a href="#">UN Environment Programme</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#">GPML</a>
            </div>
                { !isAuthenticated ?
                    <div className="rightside">
                      <Link to="/" onClick={() => loginWithRedirect()}>Join the GPML</Link>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                      <Link to="/" onClick={() => loginWithRedirect()}>Sign in</Link>
                    </div>
                    :
                    <div className="rightside">
                        <Link to="/" onClick={() => checkStatus()}>{claims?.name}</Link>
                        <Link to="/" onClick={() => logout({returnTo:"http://localhost:3001"})}>Logout</Link>
                    </div>
                }
          </div>
        </div>
        <header>
          <div className="ui container">
            <Link to="/"><img src={logo} className="logo" alt="GPML" /></Link>
            <Input className="src" placeholder="Search for topics" suffix={<SearchOutlined />} />
            <nav>
              <a href="#">Who we are</a>
              <a href="#">What we do</a>
              <a href="#">News</a>
              <Link to="/browse">Find and Connect</Link>
              <Button type="primary" size="large">+ Add <CaretDownOutlined /></Button>
            </nav>
          </div>
        </header>
        <Route path="/" exact component={Landing} />
        <Route path="/browse" component={Browse} />
        <Route path="/signup" component={Signup} />
      </div>
    </Router>
    )
}

export default Root
