import React from 'react'
import { Card, Row, Col, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
const { Title, Text } = Typography
const EconomicInstrumentsComponent = ({ cashReturn, subsidies, country }) => (
  <Card
    style={{
      width: '130%',
      height: '40%',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Text style={{ color: '#1B2738', fontSize: '18px', fontWeight: 'normal' }}>
      <strong>{country}</strong> has implemented the following economic
      instruments on plastics:
      <Tooltip title="Information about implemented instruments on plastics">
        <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
      </Tooltip>
    </Text>

    <Row justify="space-around">
      <Card
        bordered={false}
        style={{
          textAlign: 'center',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Title level={2} style={{ color: '#6236FF' }}>
          {cashReturn}
        </Title>
        <Text>cash for return schemes</Text>
      </Card>

      <Col span={8}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title level={2} style={{ color: '#6236FF' }}>
            {subsidies}
          </Title>
          <Text>
            regulations mandating subsidies to avoid the use of plastics
          </Text>
        </Card>
      </Col>
      <Col span={8}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title level={2} style={{ color: '#6236FF' }}>
            {cashReturn}
          </Title>
          <Text>
            regulations offering tax breaks for responsible plastics stewardship
          </Text>
        </Card>
      </Col>
    </Row>
  </Card>
)
export default EconomicInstrumentsComponent
