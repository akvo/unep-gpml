import React, { useRef, useState, useEffect } from 'react'
import { Carousel, Row, Col, Select } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import styles from './styles.module.scss'
import datastudies from './json/case-studies.json'
import CaseStudy from './CaseStudy'
import DropdownIcon from '../../images/case-studies/ic-dropdown.svg'
import { titleCase } from '../../utils/string'
import { eventTrack } from '../../utils/misc'
import Button from '../../components/button'

const CaseStudies = () => {
  const [isShownDropdown, setIsShownDropdown] = useState(false)
  const [indexSlide, setIndexSlide] = useState(0)
  const caseStudyReff = useRef()

  const slider = useRef()
  const prev = () => {
    slider.current.prev()
  }
  const next = () => {
    slider.current.next()
  }
  const goTo = (index) => {
    setIndexSlide(index)
    slider.current.goTo(index)
  }

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: caseStudyReff.current.offsetTop,
    })
  }, [])
  return (
    <Row className={styles.caseStudy} ref={caseStudyReff}>
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <Row gutter={[8, 16]} className="header-form">
            <Col lg={6} md={24} className="case-study-mobile-dropdown">
              <Col lg={6} md={24}>
                {!isShownDropdown && (
                  <Button
                    className="toggle-dropdown"
                    onClick={() => setIsShownDropdown(!isShownDropdown)}
                  >
                    <DropdownIcon />
                  </Button>
                )}
                {isShownDropdown && (
                  <Select
                    dropdownClassName="overlay-zoom"
                    className="case-study-dropdown"
                    defaultValue={0}
                    onChange={(value) => goTo(value)}
                    suffixIcon={<DropdownIcon />}
                    virtual={false}
                    size="large"
                    value={indexSlide}
                  >
                    {datastudies.map((c, cx) => (
                      <Select.Option key={cx} value={cx}>
                        {titleCase(c.title)}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Col>
            </Col>
            <Col lg={6} md={24} className="case-study-desktop-dropdown">
              <Col lg={6} md={24}>
                <Select
                  dropdownClassName="overlay-zoom"
                  className="case-study-dropdown"
                  defaultValue={0}
                  onChange={(value) => goTo(value)}
                  virtual={false}
                  size="small"
                  value={indexSlide}
                >
                  {datastudies.map((c, cx) => (
                    <Select.Option key={cx} value={cx}>
                      {titleCase(c.title)}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Col>

            <Col lg={18} md={24} className="text-right">
              <Row justify="end" align="middle">
                <Col>
                  <Button
                    href={datastudies[indexSlide].platform_link || '#'}
                    className="green-border case-study-learn-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    ghost
                    size="small"
                  >
                    Learn More
                  </Button>
                </Col>
                <Col>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      eventTrack('Case studies', 'Download', 'Button')
                      window.open(
                        'https://wedocs.unep.org/bitstream/handle/20.500.11822/38223/Case-studies.pdf?sequence=1&isAllowed=y',
                        '_blank'
                      )
                    }}
                  >
                    <Button size="small" className="btn-download ml-1">
                      Download as pdf
                    </Button>
                  </a>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Col>
      <Col span={24}>
        <div className="case-study-wrapper">
          <Carousel
            dots={false}
            ref={slider}
            afterChange={(index) => setIndexSlide(index)}
          >
            {datastudies?.map((c, cx) => (
              <CaseStudy {...c} key={cx} />
            ))}
          </Carousel>
          <div className="carousel-control">
            <button className="carousel-prev" onClick={prev}>
              <DropdownIcon />
            </button>

            <button className="carousel-next" onClick={next}>
              <DropdownIcon />
            </button>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default CaseStudies
