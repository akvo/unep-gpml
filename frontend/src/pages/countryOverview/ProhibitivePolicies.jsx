import React from 'react'
import { Card, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

const ProhibitivePolicies = ({ bansOnPlastic, limitsPlastic, country }) => (
  <Card
    style={{
      width: '100%',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Title
      level={4}
      style={{
        color: '#1B2738',
        fontSize: '24px',
        fontWeight: 'normal',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <strong> {country}</strong> has implemented the following prohibitive
      regulatory policy instruments on plastics:
      <Tooltip title="Information about policies on plastic use and disposal">
        <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
      </Tooltip>
    </Title>
    <div style={{ marginTop: '16px' }}>
      <div
        style={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Title level={1} style={{ color: '#1B1B22' }}>
          {limitsPlastic}
        </Title>
        <Text style={{ paddingLeft: '35px', fontSize: '18px', paddingTop: '8px' }}>
          Regulatory instruments on limiting plastics use
        </Text>
      </div>
      <div
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Title level={1} style={{ color: '#1B1B22' }}>
          {bansOnPlastic}
        </Title>
        <Text style={{ paddingLeft: '35px', fontSize: '18px', paddingTop: '8px' }}>
          Regulatory instruments on plastics bans
        </Text>
      </div>
      <div
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Title level={1} style={{ color: '#1B1B22' }}>
          {2}
        </Title>
        <Text style={{ paddingLeft: '35px',fontSize: '18px', paddingTop: '8px' }}>
          Regulatory instruments on irresponsible handling of plastics
        </Text>
      </div>
    </div>
  </Card>
)
export default ProhibitivePolicies
