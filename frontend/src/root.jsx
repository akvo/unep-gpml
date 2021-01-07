import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Landing from './modules/landing/view'
import Browse from './modules/browse/view'

const Root = () => {
  return [
    <Router>
      <div id="root">
        <header>
          <Link to="/"><h2>UNEP GPML</h2></Link>
          <nav>
            <Link to="/browse">Browse</Link>
          </nav>
        </header>
        <Route path="/" exact component={Landing} />
        <Route path="/browse" component={Browse} />
      </div>
    </Router>
  ]
}

export default Root
