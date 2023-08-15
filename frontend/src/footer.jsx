import { useState, useRef } from "react";
import { LinkedinOutlined, YoutubeOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, notification } from "antd";
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
          message: err?.response?.data["errorDetails"]
            ? err?.response?.data["errorDetails"]?.email[0]
            : "Oops, something went wrong",
        });
      });
  };

  return (
    <footer>
      <div className="ui container">
        <div className="col">
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
              <Link href="/about-us">About the GPML Digital platform</Link>
            </li>
          </ul>
        </div>
        <div className="col">
          <ul>
            <li>
              <h4>GPML Tools</h4>
            </li>
            <li>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(true);
                }}
              >
                Show all tools
              </div>
            </li>
          </ul>
        </div>
        <div className="col">
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
        </div>
        <div className="col">
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
        </div>
      </div>
      <div className="ui container">
        <div className="subscribe-section">
          <div className="col">
            <ul>
              <li>
                <h5>Powered by</h5>
              </li>
              <img src="/GPML-logo-alone.svg" className="logo" alt="GPML" />
            </ul>
          </div>
          <div className="col">
            {!showMessage && (
              <div>
                <ul>
                  <li>
                    <h4>Stay tuned with the GPML latest news and events!</h4>
                  </li>
                </ul>
                <Input.Group compact>
                  <Input
                    placeholder="Email"
                    value={email}
                    onChange={handleChange}
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
          <div>
            <img src="/footer-logo.svg" alt="unep" />
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
          </div>
          <div className="unepInfo">
            <h2>
              The Digital Platform is a UNEP contribution to the the Global
              Partnership on Plastic Pollution and Marine Litter (GPML)
            </h2>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
