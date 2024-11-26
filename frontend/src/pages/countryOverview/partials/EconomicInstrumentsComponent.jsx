import React from 'react'
import { Card, Row, Col, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const EconomicInstrumentsComponent = ({
  cashReturn,
  subsidies,
  disincentives,
  education,
  dataCollection,
  labeling,
  country,
}) => (
  <Card
    style={{
      width: '130%',
      height: '50%',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Text
      style={{
        color: '#1B1B22',
        fontSize: '24px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
      }}
    >
      <strong>{country}</strong> has implemented the following economic policy
      instruments on plastics:​
      <Tooltip title="Information about implemented instruments on plastics">
        <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
      </Tooltip>
    </Text>

    <Row justify="space-around" style={{ marginTop: '20px' }}>
      <Col span={6}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            height: '50%',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title level={2} style={{ color: '#1B1B22' }}>
            {cashReturn}
          </Title>
          <Text style={{ fontSize: '18px' }}>Cash for return schemes</Text>
        </Card>
      </Col>
      <Col span={10}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title level={2} style={{ color: '#1B1B22' }}>
            {subsidies}
          </Title>
          <Text style={{ paddingLeft: '35px', fontSize: '18px' }}>
            Regulations mandating subsidies to avoid the use of plastics
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
          <Title level={2} style={{ color: '#1B1B22' }}>
            {disincentives}
          </Title>
          <Text style={{ fontSize: '18px' }}>
            Disincentives to irresponsible plastics stewardship
          </Text>
        </Card>
      </Col>
    </Row>

    <Text
      style={{
        color: '#1B2738',
        fontSize: '24px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
      }}
    >
      <strong>{country}</strong> has implemented the following
      information-related policy instruments on plastics:​
      <Tooltip title="Information about implemented instruments on plastics">
        <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
      </Tooltip>
    </Text>

    <Row justify="space-around" style={{ marginTop: '20px' }}>
      <Col span={6}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title
            level={2}
            style={{ fontFamily: 'Inter, sans-serif', color: '#1B1B22' }}
          >
            {dataCollection}
          </Title>
          <Text style={{ fontSize: '18px' }}>
            Regulatory instruments on plastics data collection
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
          <Title level={2} style={{ color: '#1B1B22' }}>
            {education}
          </Title>
          <Text style={{ paddingLeft: '35px', fontSize: '18px' }}>
            Regulatory instruments on education and outreach​
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
          <Title level={2} style={{ color: '#1B1B22' }}>
            {labeling}
          </Title>
          <Text style={{ paddingLeft: '35px', fontSize: '18px' }}>
            Regulatory instruments on plastics labelling​
          </Text>
        </Card>
      </Col>
    </Row>
  </Card>
)

export default EconomicInstrumentsComponent
