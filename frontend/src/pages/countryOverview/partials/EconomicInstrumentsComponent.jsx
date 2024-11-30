import React from 'react'
import { Card, Row, Col, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getBaseUrl } from '../../../utils/misc'

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
  const baseUrl = getBaseUrl()
  const economicPolicyData = [
    { count: cashReturn, text: 'Cash for return schemes' },
    {
      count: subsidies,
      text: 'Subsidies supporting plastic pollution reduction',
    },
    {
      count: disincentives,
      text:
        'Disincentives to irresponsible plastic stewardship​',
    },
    {
      count: education,
      text: 'Regulatory instruments on education and outreach​',
    },
    {
      count: dataCollection,
      text: 'Regulatory instruments on plastics data collection​',
    },
    {
      count: labeling,
      text: 'Regulatory instruments on plastics labelling​',
    },
  ]

  const renderPolicyItems = (data) =>
    data.map((item, index) => (
      <Col
        key={index}
        xs={24}
        sm={12}
        md={8}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
          }}
        >
          <Title
            level={2}
            style={{
              margin: 0,
              color: '#020A5B',
              textAlign: 'center',
            }}
          >
            {item.count}
          </Title>
        </div>
        <div
          style={{
            width: '2px',
            height: '40px',
            backgroundColor: '#00F1BF',
            margin: '0 12px',
          }}
        ></div>
        <Text
          style={{
            fontSize: '16px',
            color: '#1B1B22',
            textAlign: 'left',
          }}
        >
          {item.text}
        </Text>
      </Col>
    ))

  return (
    <Card
      style={{
        borderRadius: '14px',
        width: '129%',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '20px',
      }}
    >
      <Text
        style={{
          color: '#1B1B22',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        <strong style={{ color: '#020A5B' }}>{decodeURIComponent(country)}</strong> has implemented
        the following economic and information policy instruments on plastics:
        <Tooltip title="See the global dataset">
          <a
            href={`${baseUrl}/data/maps?categoryId=governance-and-regulations&subcategoryId=Economic-instruments`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
          </a>
        </Tooltip>
      </Text>

      <Row justify="center" gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {renderPolicyItems(economicPolicyData)}
      </Row>
    </Card>
  )
}

export default EconomicInstrumentsComponent
