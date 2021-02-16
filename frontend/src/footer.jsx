import { Link } from 'react-router-dom'
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons'
import unepLogo from './images/UNEP-logo.svg'

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
export default Footer