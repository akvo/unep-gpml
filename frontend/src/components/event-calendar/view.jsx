import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Select,
  Card,
  Calendar,
  Row,
  Col,
  Badge,
  Carousel as AntdCarousel,
} from 'antd'
import {
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
  ArrowRightOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import styles from './styles.module.scss'
import 'react-multi-carousel/lib/styles.css'
import moment from 'moment'
import { UIStore } from '../../store'
import imageNotFound from '../../images/image-not-found.png'
import { TrimText } from '../../utils/string'
import api from '../../utils/api'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Trans } from '@lingui/macro'
import Button from '../../components/button'

const EventCalendar = ({ isAuthenticated, setLoginVisible }) => {
  const router = useRouter()
  const path = router.pathname
  const dateNow = moment().format('YYYY/MM/DD')
  const [event, setEvent] = useState([])
  const [data, setData] = useState([])
  const [selectedDate, setSelectedDate] = useState(dateNow)

  const eventCarousel = useRef(null)

  const dateCellRender = (value) => {
    const calendarDate = moment.parseZone(value).format('YYYY/MM/DD')
    if (data && data?.results) {
      const eventByDate = data.results
        .map((x) => {
          const startDate = moment.parseZone(x.startDate).format('YYYY/MM/DD')
          const endDate = moment.parseZone(x.endDate).format('YYYY/MM/DD')
          if (calendarDate >= startDate && calendarDate <= endDate) {
            return {
              ...x,
              date: calendarDate,
              isStart: calendarDate === startDate,
            }
          }
          return null
        })
        .filter((x) => x)
      const start = eventByDate.filter(
        (x) => x.date === calendarDate && x.isStart
      )
      const highlight = eventByDate.filter(
        (x) => x.date === calendarDate && !x.isStart
      )
      if (start.length > 0) {
        return <Badge status="warning" />
      }
      if (highlight.length > 0) {
        return <Badge status="default" />
      }
      return ''
    }
    return
  }

  const generateEvent = useCallback(
    (filterDate, searchNextEvent = false) => {
      const eventNow = data.results.filter((x, i) => {
        const startDate = moment.parseZone(x.startDate).format('YYYY/MM/DD')
        const endDate = moment.parseZone(x.endDate).format('YYYY/MM/DD')
        return filterDate >= startDate && filterDate <= endDate
      })

      const year = new Date().getFullYear()

      const futureDate = moment
        .parseZone(`${year + 5}/04/01`)
        .format('YYYY/MM/DD')

      if (!eventNow.length && searchNextEvent && filterDate <= futureDate) {
        const nextDay = moment
          .parseZone(filterDate, 'YYYY/MM/DD')
          .add(1, 'days')
          .format('YYYY/MM/DD')

        generateEvent(nextDay, searchNextEvent)
      }
      if (eventNow.length || !searchNextEvent) {
        setEvent(eventNow)
      }
    },
    [data]
  )

  const handleOnDateSelected = (value) => {
    setEvent(null)
    const selectedDate = moment.parseZone(value).format('YYYY/MM/DD')
    setSelectedDate(selectedDate)
    generateEvent(selectedDate)
  }

  const onThisDayText =
    dateNow === selectedDate
      ? 'this day'
      : moment.parseZone(selectedDate, 'YYYY/MM/DD').format('DD MMM YYYY')

  useEffect(() => {
    if (data.length === 0) {
      api
        .get('browse?topic=event')
        .then((resp) => {
          setData(resp.data)
        })
        .catch((err) => {
          console.error(err)
          setData([])
        })
    }
    if (data && data?.results) {
      generateEvent(dateNow, true)
    }
  }, [data, dateNow, generateEvent])

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = 'home'
    })
  }, [])

  return (
    <div className={styles.event}>
      <div className="ui container">
        <div className="section-title white">
          <h2>
            <Trans>Upcoming Events</Trans>{' '}
            <span className="see-more-link">
              <Link href="/knowledge/library/map/event" legacyBehavior>
                <a>
                  <Trans>See all</Trans> <RightOutlined />
                </a>
              </Link>
            </span>
          </h2>
          {path === '/events' && (
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  router.push(
                    {
                      pathname: '/flexible-forms',
                      query: { type: 'event_flexible', label: 'Event' },
                    },
                    '/flexible-forms'
                  )
                } else {
                  setLoginVisible(true)
                }
              }}
              ghost
              className="event-add-button"
              withArrow
            >
              <Trans>Add An Event</Trans>
            </Button>
          )}
        </div>
        <div className="body">
          <div className="content">
            {(!data || !event) && (
              <div className="no-event">
                <h2 className="loading text-white">
                  <LoadingOutlined spin /> <Trans>Loading...</Trans>
                </h2>
              </div>
            )}
            {data && event && event.length === 0 && (
              <div className="no-event">
                <Trans>No event on</Trans> {onThisDayText}
              </div>
            )}
            {event &&
              event.length > 0 &&
              renderEventContent(router, event, eventCarousel, onThisDayText)}
          </div>
          <div className="calendar">
            <Calendar
              fullscreen={true}
              onPanelChange={handleOnDateSelected}
              onSelect={handleOnDateSelected}
              headerRender={(e) =>
                calendarHeader({
                  ...e,
                  isShownAddButton: path === '/connect/events' ? true : false,
                })
              }
              dateCellRender={dateCellRender}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const renderEventContent = (router, event, eventCarousel, onThisDayText) => {
  return (
    <>
      {event.length > 0 && (
        <div className="event-more">
          <span>
            {event.length} <Trans>event</Trans>
            {event.length > 1 ? 's' : ''} <Trans>on</Trans> {onThisDayText}
          </span>
          {event.length > 1 && (
            <div className="button-carousel">
              <Button
                type="link"
                icon={<LeftOutlined />}
                onClick={(e) => {
                  eventCarousel.current.prev()
                }}
              />
              <Button
                type="link"
                icon={<RightOutlined />}
                onClick={(e) => {
                  eventCarousel.current.next()
                }}
              />
            </div>
          )}
        </div>
      )}
      <AntdCarousel
        autoplay
        dots={{ className: 'custom-dots' }}
        ref={eventCarousel}
      >
        {event.length &&
          event.map((x, i) => {
            const { id, title, description, type, image } = x

            const startDate = moment.parseZone(x.startDate).format('YYYY/MM/DD')
            const endDate = moment.parseZone(x.endDate).format('YYYY/MM/DD')
            const startDateText = moment
              .parseZone(startDate, 'YYYY/MM/DD')
              .format('DD MMMM YYYY')
            const endDateText = moment
              .parseZone(endDate, 'YYYY/MM/DD')
              .format('DD MMMM YYYY')
            const dateText =
              startDate < endDate
                ? `${startDateText} - ${endDateText}`
                : startDateText

            return (
              <Card
                key={`event-${id}-${i}`}
                className="item"
                onClick={() => router.push(`/event/${id}`)}
              >
                <div className="item-meta">
                  <div className="date">{dateText}</div>
                  <div className="status">
                    <Trans>Online</Trans>
                  </div>
                  <div className="mark">
                    <Trans>Featured</Trans>
                  </div>
                </div>
                <div className="resource-label upper margin">{type}</div>
                <img
                  className="item-img"
                  width="100%"
                  src={image ? image : imageNotFound}
                  alt={title}
                />
                <div className="item-body">
                  <div className="asset-title">{title}</div>
                  <div className="body-text">
                    {TrimText({ text: description, max: 300 })}
                  </div>
                </div>
                <div className="item-footer">
                  <span className="read-more">
                    <Link href={`/event/${id}`}>
                      <a>
                        <Trans>Read more</Trans> <ArrowRightOutlined />
                      </a>
                    </Link>
                  </span>
                  {x?.recording && (
                    <span className="read-more">
                      <a
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(
                            x?.recording.includes('https://')
                              ? x?.recording
                              : 'https://' + x?.recording,
                            '_blank'
                          )
                        }}
                      >
                        <Trans>Event Recording</Trans>
                      </a>
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
      </AntdCarousel>
    </>
  )
}

const calendarHeader = ({ value, onChange, isShownAddButton }) => {
  const start = 0
  const end = 12
  const monthOptions = []

  const current = value.clone()
  const localeData = value.localeData()
  const months = []
  for (let i = 0; i < 12; i++) {
    current.month(i)
    months.push(localeData.months(current))
  }

  for (let index = start; index < end; index++) {
    monthOptions.push(
      <Select.Option className="month-item" key={`${index}`}>
        {months[index]}
      </Select.Option>
    )
  }
  const month = value.month()

  const year = value.year()
  const options = []
  for (let i = year - 10; i < year + 10; i += 1) {
    options.push(
      <Select.Option key={i} value={i} className="year-item">
        {i}
      </Select.Option>
    )
  }

  function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
  }

  const daysInSelectedMonth = daysInMonth(month + 1, year)

  const day = value.date()

  const days = []
  for (let i = 1; i < daysInSelectedMonth + 1; i += 1) {
    days.push(
      <Select.Option key={i} value={i} className="day-item">
        {i}
      </Select.Option>
    )
  }

  return (
    <div style={{ padding: 8 }}>
      <Row gutter={8} justify="end">
        {!isShownAddButton && (
          <Col>
            <Select
              showSearch={true}
              dropdownMatchSelectWidth={false}
              dropdownClassName="event-overlay-zoom"
              className="day-select"
              onChange={(newDay) => {
                const now = value.clone().date(newDay)
                onChange(now)
              }}
              value={String(day)}
            >
              {days}
            </Select>
          </Col>
        )}

        <Col>
          <Select
            showSearch={true}
            dropdownMatchSelectWidth={false}
            dropdownClassName="event-overlay-zoom"
            className="year-select"
            onChange={(newYear) => {
              const now = value.clone().year(newYear)
              onChange(now)
            }}
            value={String(year)}
          >
            {options}
          </Select>
        </Col>
        <Col>
          <Select
            dropdownMatchSelectWidth={false}
            dropdownClassName="event-overlay-zoom"
            className="month-select"
            onChange={(selectedMonth) => {
              const newValue = value.clone()
              newValue.month(parseInt(selectedMonth, 10))
              onChange(newValue)
            }}
            value={String(month)}
          >
            {monthOptions}
          </Select>
        </Col>
      </Row>
    </div>
  )
}

export default EventCalendar
