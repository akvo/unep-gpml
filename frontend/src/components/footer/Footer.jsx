import { useEffect, useState } from 'react'
import { Input, Form, notification } from 'antd'
import styles from './footer.module.scss'
import { Trans, t } from '@lingui/macro'
import Link from 'next/link'
import { ArrowRight, LinkedinIcon, YoutubeIcon } from '../../components/icons'
import moment from 'moment'
import Button from '../../components/button'
import api from '../../utils/api'
import Image from 'next/image'
import { useLingui } from '@lingui/react'

const Footer = ({ showTools }) => {
  const { i18n } = useLingui()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showCookieConsent, setShowCookieConsent] = useState(true)

  const { _locale } = i18n

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (cookieConsent) {
      setShowCookieConsent(false)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowCookieConsent(false)
  }

  const onFinish = (values) => {
    setLoading(true)
    api
      .post('/subscribe', { email: values.email })
      .then(async (res) => {
        form.resetFields()
        setLoading(false)
        notification.success({
          message: `You have been successfully subscribed!`,
        })
      })
      .catch((err) => {
        setLoading(false)
        notification.error({
          message: err?.response?.data['errorDetails']
            ? err?.response?.data['errorDetails']?.email[0]
            : 'Oops, something went wrong',
        })
      })
  }
  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className="footer-items">
          <div className="footer-item">
            <strong className="p-l">GPML Digital Platform</strong>
            <div className="contact-us">
              <p className="p-m">
                <Trans>Contact Us</Trans>
              </p>
              <a href="mailto:unep-gpmarinelitter@un.org" className="p-m">
                unep-gpmarinelitter@un.org
              </a>
              <Link href="/privacy-policy-and-terms-of-use.pdf">
                <Trans>Privacy Policy & Terms of Use</Trans>
              </Link>
            </div>
            <div style={{ marginTop: 30 }}>
              <h6>
                <Trans>Follow Us</Trans>
              </h6>
              <ul className="social-links">
                <li>
                  <a
                    href="https://ke.linkedin.com/company/global-partnership-on-marine-litter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedinIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/channel/UCoWXFwDeoD4c9GoXzFdm9Bg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <YoutubeIcon />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* <div className="footer-item">
              <h6 className="title">About us</h6>
              <ul>
                <li>
                  <Link href="/landing">Who we are</Link>
                </li>
                <li>
                  <Link href="/landing">What we do</Link>
                </li>
                <li>
                  <Link href="/landing">About the GPML Digital platform</Link>
                </li>
              </ul>
            </div> */}
          <div className="footer-item quick-links">
            <h6 className="title">
              <Trans>Quick Links</Trans>
            </h6>
            <ul>
              <li>
                <a href="https://www.unep.org/explore-topics/oceans-seas/global-partnership-plastic-pollution-and-marine-litter">
                  UNEP GPML
                </a>
              </li>
              <li>
                <a href="https://www.unep.org/topics/chemicals-and-pollution-action/plastic-pollution/one-plastics-initiative/about-unep-plastics">
                  UNEP One Plastics Initiative
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-item powered-by">
            <h6 className="title">
              <Trans>Powered by</Trans>
            </h6>
            <Image
              src={`/powered-by-footer${
                _locale === 'en' ? '' : `-${_locale}`
              }.png`}
              // width={425}
              // height={143}
              width={0} // Set width to 0
              height={0} // Set height to 0
              sizes="100vw" // Optional: Specify responsive sizes
              style={{ height: '143px', width: 'auto' }}
            />
          </div>
        </div>
        <hr />
        <div className="footer-bar">
          <div>
            <p className="h-xxs">
              <Trans>
                Copyright © {moment().format('YYYY')} All rights reserved
              </Trans>
            </p>
          </div>
          {showCookieConsent && (
            <div className="footer-confirm-cookies">
              <div>
                <Trans>
                  <p className="h-xxs">
                    <Trans>We use cookies for better service.</Trans>
                  </p>
                  <Button type="link">
                    <Link href="/privacy-policy-and-terms-of-use.pdf">
                      <Trans>Learn More</Trans>
                    </Link>
                  </Button>
                  <Button type="link" onClick={handleAccept}>
                    <Trans>Accept</Trans>
                  </Button>
                </Trans>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
