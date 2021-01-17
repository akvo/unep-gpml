import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { Input, Button } from 'antd'
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css';
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import logo from './images/GPML-logo.svg'
import Signup from './modules/signup/view';
import axios from 'axios';


const Root = () => {
    const {
          isAuthenticated,
          isLoading,
          getIdTokenClaims,
          loginWithRedirect,
          logout,
        } = useAuth0();
    const [claims, setClaims] = useState(null);
    const [profile, setProfile] = useState({isAuthenticated:false});

    useEffect(() => {
        (async function fetchData() {
            const response = await getIdTokenClaims();
            if (!profile.isAuthenticated && response) {
                const theProfile = await axios.get('/api/profile', {headers: {
                    Authorization: `Bearer ${response._raw}`
                }});
                setProfile({isAuthenticated:true, ...theProfile.data});
            }
            setClaims(response);
        })();
    });

    const checkStatus = () => {
        console.log(profile);
    }

    if (isLoading) {
        return <div>Loading</div>
    }

    return (
    <Router>
      <div id="root">
        <div className="topbar">
          <div className="ui container">
            <div className="leftside">
            <Link to="/">UN Environment Programme</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<Link to="/">GPML</Link>
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
                        &nbsp;&nbsp;|&nbsp;&nbsp;
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
              <Link to="/">Who we are</Link>
              <Link to="/">What we do</Link>
              <Link to="/">News</Link>
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
