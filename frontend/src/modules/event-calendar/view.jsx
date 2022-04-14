import { UIStore } from "../../store";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Select,
  Card,
  Calendar,
  Row,
  Col,
  Badge,
  Carousel as AntdCarousel,
} from "antd";
import {
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import "./styles.scss";
import "react-multi-carousel/lib/styles.css";
import moment from "moment";
import imageNotFound from "../../images/image-not-found.png";
import { TrimText } from "../../utils/string";
import api from "../../utils/api";

const EventCalendar = withRouter(({ history }) => {
  const path = history.location.pathname;
  const dateNow = moment().format("YYYY/MM/DD");
  const [event, setEvent] = useState([]);
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dateNow);

  const eventCarousel = useRef(null);

  const dateCellRender = (value) => {
    const calendarDate = moment(value).format("YYYY/MM/DD");
    if (data && data?.results) {
      const eventByDate = data.results
        .map((x) => {
          const startDate = moment(x.startDate).format("YYYY/MM/DD");
          const endDate = moment(x.endDate).format("YYYY/MM/DD");
          if (calendarDate >= startDate && calendarDate <= endDate) {
            return {
              ...x,
              date: calendarDate,
              isStart: calendarDate === startDate,
            };
          }
          return null;
        })
        .filter((x) => x);
      const start = eventByDate.filter(
        (x) => x.date === calendarDate && x.isStart
      );
      const highlight = eventByDate.filter(
        (x) => x.date === calendarDate && !x.isStart
      );
      if (start.length > 0) {
        return <Badge status="warning" />;
      }
      if (highlight.length > 0) {
        return <Badge status="default" />;
      }
      return "";
    }
    return;
  };

  const generateEvent = useCallback(
    (filterDate, searchNextEvent = false) => {
      const eventNow = data.results.filter((x, i) => {
        const startDate = moment(x.startDate).format("YYYY/MM/DD");
        const endDate = moment(x.endDate).format("YYYY/MM/DD");
        return filterDate >= startDate && filterDate <= endDate;
      });
      if (!eventNow.length && searchNextEvent) {
        const nextDay = moment(filterDate, "YYYY/MM/DD")
          .add(1, "days")
          .format("YYYY/MM/DD");
        generateEvent(nextDay, searchNextEvent);
      }
      if (eventNow.length || !searchNextEvent) {
        setEvent(eventNow);
      }
    },
    [data]
  );

  const handleOnDateSelected = (value) => {
    setEvent(null);
    const selectedDate = moment(value).format("YYYY/MM/DD");
    setSelectedDate(selectedDate);
    generateEvent(selectedDate);
  };

  const onThisDayText =
    dateNow === selectedDate
      ? "this day"
      : moment(selectedDate, "YYYY/MM/DD").format("DD MMM YYYY");

  useEffect(() => {
    if (!data) {
      api
        .get("browse?topic=event")
        .then((resp) => {
          setData(resp.data);
        })
        .catch((err) => {
          console.error(err);
          setData([]);
        });
    }
    if (data && data?.results) {
      generateEvent(dateNow, true);
    }
  }, [data, dateNow, generateEvent]);

  useEffect(() => {
    UIStore.update((e) => {
      e.disclaimer = "home";
    });
  }, []);

  return (
    <div className="event section-container">
      <div className="ui container">
        <div className="section-title green">
          <h2>
            Upcoming Events{" "}
            <span className="see-more-link">
              <Link to="/knowledge-library?topic=event">
                See all <RightOutlined />
              </Link>
            </span>
          </h2>
        </div>
        <div className="body">
          <div className="content">
            {(!data || !event) && (
              <div className="no-event">
                <h2 className="loading text-white">
                  <LoadingOutlined spin /> Loading...
                </h2>
              </div>
            )}
            {data && event && event.length === 0 && (
              <div className="no-event">No event on {onThisDayText}</div>
            )}
            {event &&
              event.length > 0 &&
              renderEventContent(history, event, eventCarousel, onThisDayText)}
          </div>
          <div className="calendar">
            <Calendar
              fullscreen={true}
              onPanelChange={handleOnDateSelected}
              onSelect={handleOnDateSelected}
              headerRender={(e) =>
                calendarHeader({
                  ...e,
                  isShownAddButton: path === "/events" ? true : false,
                })
              }
              dateCellRender={dateCellRender}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const renderEventContent = (history, event, eventCarousel, onThisDayText) => {
  return (
    <>
      {event.length > 0 && (
        <div className="event-more">
          <span>
            {event.length} event{event.length > 1 ? "s" : ""} on {onThisDayText}
          </span>
          {event.length > 1 && (
            <div className="button-carousel">
              <Button
                type="link"
                icon={<LeftOutlined />}
                onClick={(e) => {
                  eventCarousel.current.prev();
                }}
              />
              <Button
                type="link"
                icon={<RightOutlined />}
                onClick={(e) => {
                  eventCarousel.current.next();
                }}
              />
            </div>
          )}
        </div>
      )}
      <AntdCarousel
        autoplay
        dots={{ className: "custom-dots" }}
        ref={eventCarousel}
      >
        {event.length &&
          event.map((x, i) => {
            const { id, title, description, type, image } = x;

            const startDate = moment(x.startDate).format("YYYY/MM/DD");
            const endDate = moment(x.endDate).format("YYYY/MM/DD");
            const startDateText = moment(startDate, "YYYY/MM/DD").format(
              "DD MMMM YYYY"
            );
            const endDateText = moment(endDate, "YYYY/MM/DD").format(
              "DD MMMM YYYY"
            );
            const dateText =
              startDate < endDate
                ? `${startDateText} - ${endDateText}`
                : startDateText;

            return (
              <Card
                key={`event-${id}-${i}`}
                className="item"
                onClick={() => history.push(`/event/${id}`)}
              >
                <div className="item-meta">
                  <div className="date">{dateText}</div>
                  <div className="status">Online</div>
                  <div className="mark">Featured</div>
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
                    <Link to={`/event/${id}`}>
                      Read more <ArrowRightOutlined />
                    </Link>
                  </span>
                  {x?.recording && (
                    <span className="read-more">
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            x?.recording.includes("https://")
                              ? x?.recording
                              : "https://" + x?.recording,
                            "_blank"
                          );
                        }}
                      >
                        Event Recording
                      </a>
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
      </AntdCarousel>
    </>
  );
};

const calendarHeader = ({ value, onChange, isShownAddButton }) => {
  const start = 0;
  const end = 12;
  const monthOptions = [];

  const current = value.clone();
  const localeData = value.localeData();
  const months = [];
  for (let i = 0; i < 12; i++) {
    current.month(i);
    months.push(localeData.months(current));
  }

  for (let index = start; index < end; index++) {
    monthOptions.push(
      <Select.Option className="month-item" key={`${index}`}>
        {months[index]}
      </Select.Option>
    );
  }
  const month = value.month();

  const year = value.year();
  const options = [];
  for (let i = year - 10; i < year + 10; i += 1) {
    options.push(
      <Select.Option key={i} value={i} className="year-item">
        {i}
      </Select.Option>
    );
  }
  return (
    <div style={{ padding: 8 }}>
      <Row gutter={8} justify="end">
        {isShownAddButton && (
          <Link to="/add-event">
            <Button type="primary" className="event-add-button">
              Add Event
            </Button>
          </Link>
        )}

        <Col>
          <Select
            showSearch={true}
            dropdownMatchSelectWidth={false}
            className="year-select"
            onChange={(newYear) => {
              const now = value.clone().year(newYear);
              onChange(now);
            }}
            value={String(year)}
          >
            {options}
          </Select>
        </Col>
        <Col>
          <Select
            dropdownMatchSelectWidth={false}
            className="month-select"
            onChange={(selectedMonth) => {
              const newValue = value.clone();
              newValue.month(parseInt(selectedMonth, 10));
              onChange(newValue);
            }}
            value={String(month)}
          >
            {monthOptions}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default EventCalendar;
