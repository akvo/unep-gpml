import React, { useState, useRef } from 'react'
import {
  Layout,
  Carousel,
  PageHeader,
  Typography,
  Row,
  Col,
  List,
  Card,
} from 'antd'
import { groupBy } from 'lodash'

const { Title } = Typography

import styles from './styles.module.scss'

import Banner from './banner'
import capacities from './json/capacity-building.json'
import slides from './json/slider.json'

import DropdownIcon from '../../images/case-studies/ic-dropdown.svg'
import { CapacityCard } from './capacity-card'

import { eventTrack } from '../../utils/misc'
import Button from '../../components/button'

const CapacityBuilding = () => {
  const slider = useRef()

  const prev = () => {
    slider.current.prev()
  }
  const next = () => {
    slider.current.next()
  }
  const groupCapacities = groupBy(capacities, 'category')

  return (
    <Row className={styles.capacityBuilding}>
      <Col span={24} className="ui-header">
        <div className="ui-container">
          <div>
            <div style={{ margin: 'auto 0' }}>
              <Title level={3}>
                <span className="text-green">
                  Capacity Development &amp; Awareness
                </span>
              </Title>
            </div>
          </div>
        </div>
      </Col>
      <Col span={24}>
        <div className="">
          <Col span={24} style={{ position: 'relative' }}>
            <Carousel className="pm_event_banner" ref={slider}>
              {slides.map((b, bx) => (
                <Banner key={bx} {...b} />
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
          </Col>
          <Col span={24} style={{ padding: '0 16px', marginTop: 45 }}>
            {Object.keys(groupCapacities)?.map((g, gx) => (
              <div
                className={`capacity-section bg-image ${groupCapacities[g][0]?.category_id}`}
                key={gx}
              >
                <PageHeader
                  title={<span className="text-green text-upper">{g}</span>}
                  extra={
                    <Button
                      href="/knowledge/library"
                      target="_blank"
                      rel="noopener noreferrer"
                      type="primary"
                      className="green-border"
                      withArrow
                    >
                      See all
                    </Button>
                  }
                />
                <div className="section-content">
                  <List
                    grid={{
                      gutter: 16,
                      xs: 1,
                      sm: 1,
                      md: 2,
                      lg: 2,
                      xl: 3,
                      xxl: 3,
                    }}
                    dataSource={groupCapacities[g] || []}
                    renderItem={(item) => {
                      return (
                        <List.Item>
                          <a
                            href={item.platform_link}
                            target="_blank"
                            onClick={(e) => {
                              e.preventDefault()
                              eventTrack('Learning', 'View Url', 'Button')
                              window.open(item.platform_link, '_blank')
                            }}
                            rel="noopener noreferrer"
                          >
                            <CapacityCard {...item} />
                          </a>
                        </List.Item>
                      )
                    }}
                  />
                </div>
              </div>
            ))}
          </Col>
        </div>
      </Col>
    </Row>
  )
}

export default CapacityBuilding
