import React from 'react'
import { Input, Form } from 'antd'
import Link from 'next/link'
import moment from 'moment'

import styles from './style.module.scss'
import { ArrowRight, LinkedinIcon, YoutubeIcon } from '../icons'
import Button from '../button'

const Footer = () => {
  const [form] = Form.useForm()

  const onFinish = (values) => {
    console.log('Finish:', values)
  }

  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className="footer-items">
          <div className="footer-item">
            <strong className="p-l">GPML Digital Platform</strong>
            <div className="contact-us">
              <p className="p-m">Contact Us</p>
              <a href="mailto:unep-gpmarinelitter@un.org" className="p-m">
                unep-gpmarinelitter@un.org
              </a>
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
          <div className="footer-item">
            <h6 className="title">GPML Tools</h6>
            <ul>
              <li>
                <Link href="/landing">Show all tools</Link>
              </li>
            </ul>
          </div>
          <div className="footer-item">
            <h6 className="title">Join Newsletter</h6>
            <div className="footer-newsletter">
              <div>
                <p className="h-xs">
                  Stay tuned with the GPML latest news and events!
                </p>
              </div>
              <div className="newsletter-container">
                <Form
                  form={form}
                  name="newsletter"
                  layout="inline"
                  onFinish={onFinish}
                >
                  <Form.Item name="email">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      bordered={false}
                    />
                  </Form.Item>
                  <Form.Item shouldUpdate>
                    {() => (
                      <button type="submit">
                        <ArrowRight viewBox="0 0 15 24" />
                      </button>
                    )}
                  </Form.Item>
                </Form>
              </div>
              <div>
                <h6>Follow Us</h6>
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
          </div>
        </div>
        <hr />
        <div className="footer-bar">
          <div>
            <p className="h-xxs">
              Copyright © {moment().format('YYYY')} All rights reserved
            </p>
          </div>
          <div className="footer-confirm-cookies">
            <p className="h-xxs">We use cookies for better service.</p>
            <Button type="link">Accept</Button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
