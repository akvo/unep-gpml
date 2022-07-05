import { LinkedinOutlined, YoutubeOutlined } from "@ant-design/icons";
import unepLogo from "./images/UNEP-logo.svg";
import { Link } from "react-router-dom";
import { UIStore } from "./store.js";

const Footer = ({
  isAuthenticated,
  loginWithPopup,
  setStakeholderSignupModalVisible,
  setWarningModalVisible,
  setFilterMenu,
  setLoginVisible,
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
                <Link to="/knowledge/library"> Knowledge Exchange</Link>
              </li>
              <li>
                {profile?.reviewStatus === "APPROVED" ? (
                  <Link
                    // onClick={() =>
                    //   setFilterMenu(["organisation", "stakeholder"])
                    // }
                    to="/connect/events"
                  >
                    Connect Stakeholders
                  </Link>
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      Object.keys(profile).length > 1
                        ? setWarningModalVisible(true)
                        : isAuthenticated
                        ? setStakeholderSignupModalVisible(true)
                        : setLoginVisible(true);
                    }}
                  >
                    Connect Stakeholders
                  </span>
                )}
              </li>
              <li>
                <a href="https://datahub.gpmarinelitter.org/" rel="noreferrer">
                  Data Hub
                </a>
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
                <Link
                  onClick={() => setFilterMenu(["project"])}
                  to="/knowledge/library?topic=project"
                >
                  Initiative
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setFilterMenu(["action_plan"])}
                  to="/knowledge/library?topic=action_plan"
                >
                  Action Plan
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setFilterMenu(["policy"])}
                  to="/knowledge/library?topic=policy"
                >
                  Policy
                </Link>
              </li>
              <li>
                <a
                  onClick={() => setFilterMenu(["technical_resource"])}
                  to="/knowledge/library?topic=technical_resource"
                >
                  Technical Resources
                </a>
              </li>
              <li>
                <Link
                  onClick={() => setFilterMenu(["financing_resource"])}
                  to="/knowledge/library?topic=financing_resource"
                >
                  Financing Resources
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setFilterMenu(["event"])}
                  to="/knowledge/library?topic=event"
                >
                  Event
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setFilterMenu(["technology"])}
                  to="/knowledge/library?topic=technology"
                >
                  Technology
                </Link>
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
                        : setLoginVisible(true);
                    }}
                  >
                    Sign up to the GPML Digital Platform (For All Individuals)
                  </span>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="second-footer">
        <div className="ui container unep">
          <img src={unepLogo} className="uneplogo" alt="unep" />
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
                      className="copy-right"
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
