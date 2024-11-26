import React from 'react'
import { Card, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

const PoliciesAndRegulationsComponent = ({
  country,
  baseUrl,
  plasticLeakage,
  regulatoryInstrumentsOnInnovation,
  irresponsibleHandling,
}) => (
  <Card
    style={{
      width: '100%',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '20px',
    }}
  >
    <Title
      level={4}
      style={{
        color: '#1B2738',
        fontSize: '24px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
      }}
    >
      <strong>{country}</strong> has implemented the following affirmative
      regulatory policy instruments on plastics:
      <Tooltip title="See the global dataset">
        <a
          href={`https://digital.gpmarinelitter.org/data/maps?categoryId=governance-and-regulations&subcategoryId=policies-and-plans`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          See the global dataset
          <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
        </a>
      </Tooltip>
    </Title>
    <div style={{ marginTop: '16px' }}>
      {[
        {
          count: 12,
          text:
            'Regulatory instruments on development of plans to address plastic pollution and management',
        },
        {
          count: plasticLeakage,
          text: 'Regulatory instruments to capture plastic post-leakage',
        },
        {
          count: irresponsibleHandling,
          text: 'Regulatory instruments on responsible handling of plastics',
        },
        {
          count: regulatoryInstrumentsOnInnovation,
          text: 'Regulatory instruments on innovation',
        },
      ].map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <Title
            level={1}
            style={{
              color: '#1B1B22',
              minWidth: '50px',
              textAlign: 'right',
              marginRight: '16px',
            }}
          >
            {item.count}
          </Title>
          <Text style={{ fontSize: '18px', lineHeight: '24px' }}>
            {item.text}
          </Text>
        </div>
      ))}
    </div>
  </Card>
)

export default PoliciesAndRegulationsComponent
