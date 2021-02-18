import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { Input, Button, Menu, Dropdown } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import AddEvent from './modules/events/view'
import logo from './images/GPML-temporary-logo-horiz.jpg'
import SignupModal from './modules/signup/signup-modal'
import ModalWarningUser from './utils/modal-warning-user'
import api from './utils/api';
import { storage } from './utils/storage';
import ProfileView from './modules/profile/view';
import SignupView from './modules/signup/view';
import DetailsView from './modules/details/view';
import Footer from './footer'

const Root = () => {
    const {
      isAuthenticated,
      getIdTokenClaims,
      loginWithPopup,
      logout,
      user
    } = useAuth0();
    const [profile, setProfile] = useState({});
    const [signupModalVisible, setSignupModalVisible] = useState(false)
    const [eventWarningVisible, setEventWarningVisible] = useState(false)
    const [countries, setCountries] = useState(null);
    const [data, setData] = useState(null);
    const [tags, setTags] = useState([]);
    const [initLandingCount, setInitLandingCount] = useState("");

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
              if (storage.getCookie('profile') === 'SUBMITTED' && resp.data.reviewStatus === 'APPROVED') {
                document.cookie = "profileMessage=1"
              }
              if (storage.getCookie('profile') === 'APPROVED' && resp.data.reviewStatus === 'APPROVED') {
                document.cookie = "profileMessage=0"
              }
              document.cookie = `profile=${resp.data.reviewStatus}`
            }
        }
      })();
    }, [getIdTokenClaims, isAuthenticated]);

    useEffect(() => {
      api.get('/landing')
      .then((resp) => {
        setData(resp.data)
      })
      api.get('/country')
      .then((resp) => {
        setCountries(resp.data)
        setInitLandingCount("project");
      })
      api.get('/tag')
      .then((resp) => {
        setTags(resp.data)
      })
    }, [])

    return (
    <Router>
      <div id="root">
        <div className="topbar">
          <div className="ui container">
            <div className="leftside">
            <a href="https://www.unep.org/" target="_blank" rel="noreferrer">UN Environment Programme</a>&nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="https://www.gpmarinelitter.org" target="_blank" rel="noreferrer">GPML</a>
            </div>
              { !isAuthenticated ?
                <div className="rightside">
                    <Link to="/signup">Join the GPML</Link>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <Link to="/" onClick={loginWithPopup}>Sign in</Link>
                </div>
                :
                <div className="rightside">
                  <Link to="/profile">{profile ? profile.firstName : user.nickname}</Link>
                  <Button type="link" onClick={() => logout({ returnTo: window.location.origin })}>Logout</Button>
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
              <AddButton {... {setSignupModalVisible, isAuthenticated, loginWithPopup, profile, setEventWarningVisible}} />
            </nav>
          </div>
        </header>
        <Route path="/" exact render={props => <Landing {...
          {profile, countries, data, initLandingCount, setCountries, setInitLandingCount, setEventWarningVisible, setSignupModalVisible, loginWithPopup, isAuthenticated, ...props}
          }/>} />
        <Route path="/browse" render={props => <Browse {...props} profile={profile} countData={data} setSignupModalVisible={setSignupModalVisible}/>} />
        <Route path="/add-event" component={AddEvent} />
        <Route path="/profile" render={props => <ProfileView {...{...props, profile, tags, setProfile }} />} />
        <Route path="/signup" component={SignupView} />
        <Route path="/:type/:id" component={DetailsView} />
        <Footer />
      </div>
      <SignupModal visible={signupModalVisible} onCancel={() => setSignupModalVisible(false)} {...{ tags, setProfile }} />
      <ModalWarningUser visible={eventWarningVisible} close={() => setEventWarningVisible(false)}/>
    </Router>
    )
}


const Search = withRouter(({ history }) => {
  const handleSearch = (src) => {
    if (src?.trim().length > 0) {
      history.push(`/browse/?q=${src}`)
    }
  }

  return <Input.Search onPressEnter={(e) => handleSearch(e.target.value)} onSearch={handleSearch} enterButton className="src" placeholder="Search for resources and stakeholders" size="large" />
})

const AddButton = withRouter(({ isAuthenticated, setSignupModalVisible, setEventWarningVisible, loginWithPopup, profile, history }) => {
  if(isAuthenticated){
      if (profile?.reviewStatus === "APPROVED") {
          return (
            <Dropdown overlay={(
              <Menu className="add-dropdown">
                <Menu.Item onClick={() => history.push('/add-event')}>Event</Menu.Item>
              </Menu>
            )} trigger={['click']}>
              <Button type="primary" size="large">+ Add</Button>
            </Dropdown>
          )
      }
      return <Button type="primary" size="large" onClick={e => { Object.keys(profile).length !== 0 ? setEventWarningVisible(true) : setSignupModalVisible(true)}}>+ Add</Button>
  }
  return <Button type="primary" size="large" onClick={loginWithPopup}>+ Add</Button>
})

export default Root
