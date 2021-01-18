import React from 'react'
import { Row, Col } from 'antd';
import SignUpForm from './sign-up-form'
import './styles.scss'

const Signup = () => {
    return (
        <div className="ui container">
            <Row>
                <Col span={12} offset={12}>
                    <div style={{ padding: '10px 10px', marginTop: '20px' }}>
                        <SignUpForm/>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default Signup
