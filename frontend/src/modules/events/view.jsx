import React from 'react'
import EventsForm from './events-form'
import { Row, Col, Card } from 'antd';

const Events = () => {
    return (
        <div id="events">
            <Row>
                <Col span={12} offset={12}>
                    <Card style={{margin: "20px"}}>
                    <EventsForm/>
                    </Card>
                </Col>
            </Row>
        </div>
    )

}

export default Events;
