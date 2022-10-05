import { useState, useRef, useEffect } from "react";
import { LinkedinOutlined, YoutubeOutlined } from "@ant-design/icons";
import unepLogo from "./images/footer-logo.svg";
import { Link } from "react-router-dom";
import { UIStore } from "./store.js";
import logo from "./images/gpml.svg";
import { Button, Input, notification, Alert } from "antd";
import api from "./utils/api";
import { CSSTransition } from "react-transition-group";

const Footer = ({ setShowMenu }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [timeout, setTimeoutState] = useState(300);
  const nodeRef = useRef(null);

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleChange = (event) => {
    if (!isValidEmail(event.target.value)) {
      setError("Email is invalid");
    } else {
      setError(null);
    }
    setEmail(event.target.value);
  };

  const subscribe = () => {
    setLoading(true);
    api
      .post("/subscribe", { email })
      .then(async (res) => {
        setEmail("");
        setLoading(false);
        setShowMessage(true);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err?.response);
        notification.error({
          message: err?.response?.data['errorDetails']
            ? err?.response?.data['errorDetails']?.email[0]
            : "Oops, something went wrong",
        });
      });
  };

  useEffect(() => {
    setTimeout(function () {
      setShowMessage(false);
      setTimeoutState(0);
    }, 3000);
  }, [showMessage]);

  return (
    <footer>
      <div className="ui container">
        <div className="col">
          <nav>
            <ul>
              <li>
                <h4>About Us</h4>
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
                <Link to="/about-us">About the GPML Digital platform</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="col">
          <nav>
            <ul>
              <li>
                <h4>GPML Tools</h4>
              </li>
              <li>
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMenu(true);
                  }}
                  to="/"
                >
                  Show all tools
                </Link>
              </li>
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
        </div>
        <div className="col">
          <nav>
            <ul>
              <li>
                <h4>Follow Us</h4>
              </li>
            </ul>
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
      <div className="ui container">
        <div className="subscribe-section">
          <div className="col">
            <nav>
              <ul>
                <li>
                  <h5>Powered by</h5>
                </li>
                <img src={logo} className="logo" alt="GPML" />
              </ul>
            </nav>
          </div>
          <div className="col">
            {!showMessage && (
              <div>
                <nav>
                  <ul>
                    <li>
                      <h4>Stay tuned with the GPML latest news and events!</h4>
                    </li>
                  </ul>
                </nav>
                <nav>
                  <Input.Group compact>
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={handleChange}
                      className={`${error ? "ant-input-status-error" : ""}`}
                      onPressEnter={() => subscribe()}
                    />
                    <Button
                      onClick={() => subscribe()}
                      disabled={error || email.length === 0}
                      loading={loading}
                    >
                      Subscribe
                    </Button>
                  </Input.Group>
                </nav>
              </div>
            )}
            <CSSTransition
              in={showMessage}
              nodeRef={nodeRef}
              timeout={timeout}
              classNames="success"
              unmountOnExit
            >
              <div ref={nodeRef} className="success-meesage">
                <p>You have been successfully subscribed!</p>
              </div>
            </CSSTransition>
          </div>
        </div>
      </div>
      <div className="second-footer">
        <div className="ui container unep">
          <nav>
            <img src={unepLogo} alt="unep" />
            <ul className="horizonList">
              <li className="copyright">
                <p className="copy-right">© UNEP</p>
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
          <div className="unepInfo">
            <h2>
              The Digital Platform is a UNEP contribution to the Global
              Partnership on Marine Litter (GPML)
            </h2>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
