import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { Input, Button } from 'antd'
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css';
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import AddEvent from './modules/events/view'
import logo from './images/GPML-dp.svg'
import SignupModal from './modules/signup/signup-modal'
import api from './utils/api';
import ProfileView from './modules/profile/view';
import logo2 from './images/GPML-logo-2.svg'
import unepLogo from './images/UNEP-logo.svg'
import gpmlLogo from './images/GPML-logo-alone.svg'


const Root = () => {
    const {
      isAuthenticated,
      getIdTokenClaims,
      loginWithPopup,
      logout,
      user
    } = useAuth0();
    const [profile, setProfile] = useState(null);
    const [signupModalVisible, setSignupModalVisible] = useState(false)

    useEffect(() => {
      (async function fetchData() {
        const response = await getIdTokenClaims();
        if (isAuthenticated) {
          api.setToken(response.__raw)
        } else {
          api.setToken(null)
        }
        if (isAuthenticated) {
            const resp = await api.get('/profile')
            if (Object.keys(resp.data).length === 0){
              setSignupModalVisible(Object.keys(resp.data).length === 0);
            } else {
              setProfile(resp.data);
            }
        }
      })();
    }, [getIdTokenClaims, isAuthenticated]);
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
                      <Link to="/profile">{profile ? profile.firstName : user.nickname}</Link>
                      <Button type="link" onClick={logout}>Logout</Button>
                    </div>
                }
          </div>
        </div>
        <header>
          <div className="ui container">
            <Link to="/"><img src={logo} className="logo" alt="GPML" /></Link>
            <Switch>
              <Route path="/browse" />
              <Route>
                <Search />
              </Route>
            </Switch>
            <nav>
              <Link to="/browse">Find and Connect</Link>
              <AddButton {...{ setSignupModalVisible, isAuthenticated, loginWithPopup}} />
            </nav>
          </div>
        </header>
        <Route path="/" exact component={Landing} />
        <Route path="/browse" component={Browse} />
        <Route path="/add-event" component={AddEvent} />
        <Route path="/profile" render={props => <ProfileView profile={profile} />} />
        <Footer />
      </div>
      <SignupModal visible={signupModalVisible} onCancel={() => setSignupModalVisible(false)} />
    </Router>
    )
}

const Footer = () => {
  return (
    <footer>
      <div className="ui container">
        <div className="col">
          <a href="https://www.gpmarinelitter.org/" target="_blank">
            <img src={logo2} />
            <span>Go to the GPML website</span>
          </a>
        </div>
        <div className="col">
          <img src={unepLogo} className="uneplogo" />
          <img src={gpmlLogo} className="gpmllogo" />
          <p>
            The Global Partnership on Marine Litter (GPML) is a multi-stakeholder partnership that brings together all actors working to prevent marine litter and microplastics. By providing a unique global platform to share knowledge and experience, partners are able to work together to create and advance solutions to this pressing global issue. 
          </p>
        </div>
      </div>
    </footer>
  )
}

const Search = withRouter(({ history }) => {
  const handlerPressEnter = (e) => {
    const src = e.target.value;
    if (src?.trim().length > 0) {
      history.push(`/browse/?q=${src}`)
    }
  }

  return <Input onPressEnter={handlerPressEnter} className="src" placeholder="Search for topics" suffix={<SearchOutlined />} size="large" />
})

const AddButton = ({ isAuthenticated, setSignupModalVisible, loginWithPopup }) => {
  if(isAuthenticated){
    return <Link to="/add-event"><Button type="primary" size="large">+ Add Event</Button></Link>
  }
  return <Button type="primary" size="large" onClick={loginWithPopup}>+ Add Event</Button>
}

export default Root
