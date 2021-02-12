import React, {useState, useEffect} from 'react'
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { Input, Button } from 'antd'
import { SearchOutlined, FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons'
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import AddEvent from './modules/events/view'
import logo from './images/GPML-temporary-logo-horiz.jpg'
import SignupModal from './modules/signup/signup-modal'
import ModalWarningUser from './utils/modal-warning-user'
import api from './utils/api';
import ProfileView from './modules/profile/view';
// import logo2 from './images/GPML-logo-2.svg'
import unepLogo from './images/UNEP-logo.svg'
// import gpmlLogo from './images/GPML-logo-alone.svg'
import SignupView from './modules/signup/view';

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
              <Link to="/browse">Find and Connect</Link>
              <AddButton {... {setSignupModalVisible, isAuthenticated, loginWithPopup, profile, setEventWarningVisible}} />
            </nav>
          </div>
        </header>
        <Route path="/" exact render={props => <Landing {...
          {profile, countries, data, initLandingCount, setCountries, setInitLandingCount, ...props}
          }/>} />
        <Route path="/browse" render={props => <Browse {...props} profile={profile} countData={data} />} />
        <Route path="/add-event" component={AddEvent} />
        <Route path="/profile" render={props => <ProfileView {...{...props, profile, tags, setProfile }} />} />
        <Route path="/signup" component={SignupView} />
        <Footer />
      </div>
      <SignupModal visible={signupModalVisible} onCancel={() => setSignupModalVisible(false)} {...{ tags, setProfile }} />
      <ModalWarningUser visible={eventWarningVisible} close={() => setEventWarningVisible(false)}/>
    </Router>
    )
}

const Footer = () => {
  return (
    <footer>
      <div className="ui container">
          <div className="col">
              <nav>
                <ul>
                  <li><h4>GPML Partnership</h4></li>
                  <li><a href="https://www.gpmarinelitter.org/who-we-are" target="_blank" rel="noreferrer">Who we are</a></li>
                  <li><a href="https://www.gpmarinelitter.org/what-we-do" target="_blank" rel="noreferrer">What we do</a></li>
                  <li><a href="https://www.gpmarinelitter.org/who-we-are/our-members" target="_blank" rel="noreferrer">Our members</a></li>
                </ul>
              </nav>
              <nav>
                <ul>
                  <li><h4>GPML Digital platform</h4></li>
                  <li><a href="#">Knowledge Exchange</a></li>
                  <li><a href="#">Connect Stakeholders</a></li>
                  <li><a href="#">Data Hub</a></li>
                </ul>
              </nav>
          </div>
          <div className="col">
              <nav>
                <ul>
                  <li><h4>Resources</h4></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=action_plan"}}>Action plans</Link></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=event"}}>Events</Link></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=financing_resource"}}>Financial resources</Link></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=technical_resource"}}>Technical resources</Link></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=technology"}}>Technologies</Link></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=policy"}}>Policies</Link></li>
                  <li><Link to={{pathname: "/browse", search:"?topic=project"}}>Projects</Link></li>
                </ul>
              </nav>
              <nav>
                <ul>
                  <li><h4>Data</h4></li>
                  <li><a href="#">SDG 14 Data</a></li>
                  <li><a href="#">Citizen Science Data</a></li>
                </ul>
              </nav>
        </div>
        <div className="col">
            <nav>
              <ul>
                <li><h4>Contact Us</h4></li>
                <li><a href="mailto:unep-gpmmarinelitter@un.org">unep-gpmmarinelitter@un.org</a></li>
              </ul>
            </nav>
            <nav>
              <ul>
                <li><h4>Join Us</h4></li>
                <li><a href="https://www.gpmarinelitter.org/who-we-are/members/sign-up" target="_blank" rel="noreferrer">Join the GPML Partnership (Entities Only)</a></li>
                <li><Link to="/signup">Sign up to the GPML Digital Platform (For All Individuals)</Link></li>
              </ul>
            </nav>
            <nav>
              <ul>
                <li><h4>Stakeholders</h4></li>
                <li><a href="#">Entities</a></li>
                <li><a href="#">Individuals</a></li>
              </ul>
            </nav>
        </div>
      </div>
      <div className="ui container unep">
        <div className="col unepLogo"><img src={unepLogo} className="uneplogo" alt="unep" /></div>
        <div className="col unepInfo"><h2>The Digital Platform is a UNEP contribution to the Global Partnership on Marine Litter (GPML)</h2></div>
      </div>
      <div className="ui container">
        <div className="footBottom">
          <div className="col">
            <nav>
              <ul className="horizonList">
                <li><p>© UNEP</p></li>
                <li><a href="#">Terms of use</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </nav>
          </div>
          <div className="col">
            <nav>
              <ul className="horizonList socialLink">
                <li><a href="#"> <FacebookOutlined /></a></li>
                <li><a href="#"> <TwitterOutlined /> </a></li>
                <li><a href="#"> <InstagramOutlined /></a></li>
                <li><a href="#"> <LinkedinOutlined /></a></li>
                <li><a href="#"> <YoutubeOutlined /></a></li>
              </ul>
            </nav>
          </div>
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

const AddButton = ({ isAuthenticated, setSignupModalVisible, setEventWarningVisible, loginWithPopup,profile}) => {
  if(isAuthenticated){
      if (profile?.reviewStatus === "APPROVED") {
          return <Link to="/add-event"><Button type="primary" size="large">+ Add Event</Button></Link>
      }
      return <Button type="primary" size="large" onClick={e => setEventWarningVisible(true)}>+ Add Event</Button>
  }
  return <Button type="primary" size="large" onClick={loginWithPopup}>+ Add Event</Button>
}

export default Root
