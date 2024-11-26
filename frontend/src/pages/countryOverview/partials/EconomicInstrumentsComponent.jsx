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
}) => {
  const economicPolicyData = [
    { count: cashReturn, text: 'Cash for return schemes' },
    { count: subsidies, text: 'Regulations mandating subsidies to avoid the use of plastics' },
    { count: disincentives, text: 'Disincentives to irresponsible plastics stewardship' },
  ]

  const informationPolicyData = [
    { count: dataCollection, text: 'Regulatory instruments on plastics data collection' },
    { count: education, text: 'Regulatory instruments on education and outreach' },
    { count: labeling, text: 'Regulatory instruments on plastics labelling' },
  ]

  const renderPolicyCards = (data) =>
    data.map((item, index) => (
      <Col key={index} span={6}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title level={2} style={{ color: '#1B1B22' }}>
            {item.count}
          </Title>
          <Text style={{ fontSize: '18px' }}>{item.text}</Text>
        </Card>
      </Col>
    ))

  return (
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
        <strong>{country}</strong> has implemented the following economic policy instruments on plastics:
        <Tooltip title="Information about implemented instruments on plastics">
          <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
        </Tooltip>
      </Text>

      <Row justify="space-around" style={{ marginTop: '20px' }}>
        {renderPolicyCards(economicPolicyData)}
      </Row>

      <Text
        style={{
          color: '#1B2738',
          fontSize: '24px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'normal',
        }}
      >
        <strong>{country}</strong> has implemented the following information-related policy instruments on plastics:
        <Tooltip title="Information about implemented instruments on plastics">
          <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
        </Tooltip>
      </Text>

      <Row justify="space-around" style={{ marginTop: '20px' }}>
        {renderPolicyCards(informationPolicyData)}
      </Row>
    </Card>
  )
}

export default EconomicInstrumentsComponent
