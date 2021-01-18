import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { Input, Button } from 'antd'
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css';
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import logo from './images/GPML-logo.svg'
import Signup from './modules/signup/view';
import axios from 'axios';
import SignupModal from './modules/signup/signup-modal'


const Root = () => {
    const {
      isAuthenticated,
      isLoading,
      getIdTokenClaims,
      loginWithPopup,
      logout,
      user
    } = useAuth0();
    const [claims, setClaims] = useState(null);
    const [profile, setProfile] = useState({ isAuthenticated: false });
    const [signupModalVisible, setSignupModalVisible] = useState(false)

    useEffect(() => {
      (async function fetchData() {
        const response = await getIdTokenClaims();
        if (!profile.isAuthenticated && response) {
          const theProfile = await axios.get('/api/profile', {headers: {
            Authorization: `Bearer ${response._raw}`
          }});
          setProfile({ isAuthenticated: true, ...theProfile.data});
        }
        setClaims(response);
      })();
    });
    useEffect(() => {
      console.log('change auth', isAuthenticated, user)
      if(isAuthenticated && user.email_verified === false){
        setSignupModalVisible(true)
      }
    }, [isAuthenticated])

    const checkStatus = () => {
        console.log(claims);
        console.log(profile);
    }

    const currentPath = window.location.pathname;
    const signUp = !isLoading && profile.isAuthenticated && !profile.hasProfile && currentPath !== '/signup';

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
                      <Link to="/" onClick={loginWithPopup}>Join the GPML</Link>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                      <Link to="/" onClick={loginWithPopup}>Sign in</Link>
                    </div>
                    :
                    <div className="rightside">
                        <Link to="/signup" onClick={() => checkStatus()}>{claims?.email_vefified ? claims?.name : "Signup"}</Link>
                        <Button type="link" onClick={logout}>Logout</Button>
                        {/*
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <Link to="/" onClick={() => logout({returnTo:"http://localhost:3001"})}>Logout</Link>
                        */}
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
          {isLoading
              ? "" : (
              <>
                  {signUp && <Redirect to="/signup"/>}
                  <Route path="/" exact component={Landing} />
                  <Route path="/browse" component={Browse} />
                  <Route path="/signup" component={Signup} />
              </>
          )}
      </div>
      <SignupModal visible={signupModalVisible} onCancel={() => setSignupModalVisible(false)} />
    </Router>
    )
}

export default Root
