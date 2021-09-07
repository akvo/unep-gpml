import { LinkedinOutlined, YoutubeOutlined } from "@ant-design/icons";
import unepLogo from "./images/UNEP-logo.svg";
import { Link } from "react-router-dom";
import { UIStore } from "./store.js";

const Footer = ({
  isAuthenticated,
  loginWithPopup,
  setStakeholderSignupModalVisible,
  setWarningModalVisible,
}) => {
  const profile = UIStore.useState((s) => s.profile);
  return (
    <footer>
      <div className="ui container">
        <div className="col">
          <nav>
            <ul>
              <li>
                <h4>GPML Partnership</h4>
              </li>
              <li>
                <a
                  href="https://www.gpmarinelitter.org/who-we-are"
                  target="_blank"
                  rel="noreferrer"
                >
                  Who we are
                </a>
              </li>
              <li>
                <a
                  href="https://www.gpmarinelitter.org/what-we-do"
                  target="_blank"
                  rel="noreferrer"
                >
                  What we do
                </a>
              </li>
              <li>
                <a
                  href="https://www.gpmarinelitter.org/who-we-are/our-members"
                  target="_blank"
                  rel="noreferrer"
                >
                  Our members
                </a>
              </li>
            </ul>
          </nav>
          <nav>
            <ul>
              <li>
                <h4>GPML Digital platform</h4>
              </li>
              <li>
                <a
                  href="https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
                  target="_blank"
                  rel="noreferrer"
                >
                  Knowledge Exchange
                </a>
              </li>
              <li>
                <a
                  href="https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
                  target="_blank"
                  rel="noreferrer"
                >
                  Connect Stakeholders
                </a>
              </li>
              <li>
                <span>Data Hub (coming soon)</span>
              </li>
            </ul>
          </nav>
        </div>
        <div className="col">
          <nav>
            <ul>
              <li>
                <h4>Resources</h4>
              </li>
              <li>
                <a href="/browse?topic=project">Initiative</a>
              </li>
              <li>
                <a href="/browse?topic=action_plan">Action Plan</a>
              </li>
              <li>
                <a href="/browse?topic=policy">Policy</a>
              </li>
              <li>
                <a href="/browse?topic=technical_resource">
                  Technical Resources
                </a>
              </li>
              <li>
                <a href="/browse?topic=financing_resource">
                  Financing Resources
                </a>
              </li>
              <li>
                <a href="/browse?topic=event">Event</a>
              </li>
              <li>
                <a href="/browse?topic=technology">Technology</a>
              </li>
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
              <li>
                <h4>Contact Us</h4>
              </li>
              <li>
                <a href="mailto:unep-gpmarinelitter@un.org">
                  unep-gpmarinelitter@un.org
                </a>
              </li>
            </ul>
          </nav>
          <nav>
            <ul>
              <li>
                <h4>Join Us</h4>
              </li>
              <li>
                <Link to="/signup">
                  Join the GPML Partnership (Entities Only)
                </Link>
              </li>
              <li>
                {profile?.reviewStatus === "APPROVED" ? (
                  <span>
                    Sign up to the GPML Digital Platform (For All Individuals)
                  </span>
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      Object.keys(profile).length > 1
                        ? setWarningModalVisible(true)
                        : isAuthenticated
                        ? setStakeholderSignupModalVisible(true)
                        : loginWithPopup();
                    }}
                  >
                    Sign up to the GPML Digital Platform (For All Individuals)
                  </span>
                )}
              </li>
            </ul>
          </nav>
          <nav>
            <ul>
              <li>
                <h4>Stakeholders</h4>
              </li>
              <li>
                {profile?.reviewStatus === "APPROVED" ? (
                  <a href="/browse?topic=organisation">Entity</a>
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      Object.keys(profile).length > 1
                        ? setWarningModalVisible(true)
                        : isAuthenticated
                        ? setStakeholderSignupModalVisible(true)
                        : loginWithPopup();
                    }}
                  >
                    Entity
                  </span>
                )}
              </li>
              <li>
                {profile?.reviewStatus === "APPROVED" ? (
                  <a href="/stakeholders?topic=stakeholder">Individual</a>
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      Object.keys(profile).length > 1
                        ? setWarningModalVisible(true)
                        : isAuthenticated
                        ? setStakeholderSignupModalVisible(true)
                        : loginWithPopup();
                    }}
                  >
                    Individual
                  </span>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="second-footer">
        <div className="ui container unep">
          <div className="unepLogo">
            <img src={unepLogo} className="uneplogo" alt="unep" />
          </div>
          <div className="unepInfo">
            <h2>
              The Digital Platform is a UNEP contribution to the Global
              Partnership on Marine Litter (GPML)
            </h2>
          </div>
        </div>
        <div className="ui container">
          <div className="footBottom">
            <div className="col">
              <nav>
                <ul className="horizonList">
                  <li>
                    <p className="copy-right">© UNEP</p>
                  </li>
                  <li>
                    <a
                      href="/privacy-policy-and-terms-of-use.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Privacy Policy &amp; Terms of use
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="col">
              <nav>
                <ul className="horizonList socialLink">
                  <li>
                    <a
                      href="https://www.linkedin.com/company/global-partnership-on-marine-litter/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <LinkedinOutlined />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <YoutubeOutlined />
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
