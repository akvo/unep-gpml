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


const Root = () => {
    const {
      isAuthenticated,
      isLoading,
      getIdTokenClaims,
      loginWithPopup,
      logout
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
        if (isAuthenticated && !profile) {
            const resp = await api.get('/profile')
            setProfile(resp.data);
            setSignupModalVisible(Object.keys(resp.data).length === 0);
        }
      })();
    }, [getIdTokenClaims, isAuthenticated, profile]);

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
              <AddButton {...{ setSignupModalVisible, isAuthenticated}} />
            </nav>
          </div>
        </header>
          {isLoading
              ? "" : (
              <>
                  <Route path="/" exact component={Landing} />
                  <Route path="/browse" component={Browse} />
                  <Route path="/add-event" component={AddEvent} />
              </>
          )}
      </div>
      <SignupModal visible={signupModalVisible} onCancel={() => setSignupModalVisible(false)} />
    </Router>
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

const AddButton = ({ isAuthenticated, setSignupModalVisible }) => {
  if(isAuthenticated){
    return <Link to="/add-event"><Button type="primary" size="large">+ Add Event</Button></Link>
  }
  return <Button type="primary" size="large" onClick={() => setSignupModalVisible(true)}>+ Add Event</Button>
}

export default Root
