import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'
import logo from './images/GPML-logo.svg'

const Root = () => {
  return [
    <Router>
      <div id="root">
        <div className="topbar">
          <div className="ui container">
            <div className="leftside">
              <a href="#">UN Environment Programme</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#">GPML</a>
            </div>
            <div className="rightside">
              <a href="#">Join the GPML</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#">Signin</a>
            </div>
          </div>
        </div>
        <header>
          <div className="ui container">
          <Link to="/"><img src={logo} className="logo" alt="GPML" /></Link>
          <nav>
            {/* <Link to="/browse">Browse</Link> */}
          </nav>
          </div>
        </header>
        <Route path="/" exact component={Landing} />
        <Route path="/browse" component={Browse} />
      </div>
    </Router>
  ]
}

export default Root
