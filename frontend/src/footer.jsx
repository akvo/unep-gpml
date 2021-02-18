import { LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons'
import unepLogo from './images/UNEP-logo.svg'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const {
    isAuthenticated,
    loginWithPopup
  } = useAuth0();

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
              <li>Knowledge Exchange</li>
              <li>Connect Stakeholders</li>
              <li>Data Hub (comming soon)</li>
            </ul>
          </nav>
        </div>
        <div className="col">
          <nav>
            <ul>
              <li><h4>Resources</h4></li>
              <li><a href="/browse?topic=action_plan">Action plans</a></li>
              <li><a href="/browse?topic=event">Events</a></li>
              <li><a href="/browse?topic=financing_resource">Financial resources</a></li>
              <li><a href="/browse?topic=technical_resource">Technical resources</a></li>
              <li><a href="/browse?topic=technology">Technologies</a></li>
              <li><a href="/browse?topic=policy">Policies</a></li>
              <li><a href="/browse?topic=project">Projects</a></li>
            </ul>
          </nav>
          <nav>
            <ul>
            {/*
              <li><h4>Data</h4></li>
              <li><a href="https://gpmldatahub-uneplive.hub.arcgis.com/datasets/2e4ea3959913412f8efb0e7f63e46544?showData=true" target="_blank" rel="noreferrer">SDG 14 Data</a></li>
              <li><a href="https://gpmldatahub-uneplive.hub.arcgis.com/datasets/841b887cfe2d49abac209d21e93fc4cc?showData=true" target="_blank" rel="noreferrer">Citizen Science Data</a></li>
              */}
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
              <li><a href="/signup">Join the GPML Partnership (Entities Only)</a></li>
              <li>{ !isAuthenticated ?
                  <Link to="/" onClick={loginWithPopup}>Sign up to the GPML Digital Platform (For All Individuals)</Link>
                  :
                  <span>Sign up to the GPML Digital Platform (For All Individuals)</span>
                  }
              </li>
            </ul>
          </nav>
          <nav>
            <ul>
              <li><h4>Stakeholders</h4></li>
              <li><span>Entities (coming soon)</span></li>
              <li>{ !isAuthenticated ?
                   <Link to="/" onClick={loginWithPopup}>Individuals</Link>
                   :
                   <a href="/browse?topic=stakeholder">Individuals</a>
                   }
              </li>
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
                <li><a href="https://www.linkedin.com/company/global-partnership-on-marine-litter/" target="_blank" rel="noreferrer"><LinkedinOutlined /></a></li>
                <li><a href="https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg" target="_blank" rel="noreferrer"><YoutubeOutlined /></a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer