import React from 'react'
import { Card, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getBaseUrl } from '../../../utils/misc'

const { Title, Text } = Typography

const PoliciesAndRegulationsComponent = ({
  country,
  plasticLeakage,
  regulatoryInstrumentsOnInnovation,
  irresponsibleHandling,
}) => {
  const baseUrl = getBaseUrl()

  return (
    <Card
      style={{
        width: '98%',
        borderRadius: '12px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '20px',
      }}
    >
      <Text
        level={4}
        style={{
          color: '#1B1B22',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        <strong style={{ color: '#020A5B' }}>{decodeURIComponent(country)}</strong> has implemented
        the following affirmative regulatory policy instruments on plastics:
        <Tooltip title="See the global dataset">
          <a
            href={`${baseUrl}/data/maps?categoryId=governance-and-regulations&subcategoryId=policies-and-plans`}
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
              marginBottom: '1%',
            }}
          >
            <Title
              level={2}
              style={{
                color: '#020A5B',
                minWidth: '10%',
                textAlign: 'right',
                marginRight: '3%',
              }}
            >
              {item.count}
            </Title>
            <div
              style={{
                width: '2px',
                height: '40px',
                backgroundColor: '#00F1BF',
                marginRight: '8px',
              }}
            ></div>
            <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
              {item.text}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default PoliciesAndRegulationsComponent
