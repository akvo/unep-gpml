import React from 'react'
import EventForm from './event-form'
import { Row, Col, Card } from 'antd';
import './styles.scss'
import AddEventForm from './form';

const Events = () => {
  return (
      <div id="add-event">
        <div className="ui container">
          <Row>
            <Col span={12}>
              <h1>Add event</h1>
            </Col>
              <Col span={12}>
                <Card>
                  <AddEventForm />
                </Card>
              </Col>
          </Row>
        </div>
      </div>
  )
}

export default Events;
