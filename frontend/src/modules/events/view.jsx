import React from 'react'
import EventForm from './event-form'
import { Row, Col, Card } from 'antd';

const Events = () => {
    return (
        <div id="events">
            <Row>
                <Col span={12} offset={12}>
                    <Card style={{margin: "20px"}}>
                    <EventForm/>
                    </Card>
                </Col>
            </Row>
        </div>
    )

}

export default Events;
