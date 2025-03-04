import React from 'react'
import { Card, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getBaseUrl } from '../../utils/misc'
import { t, Trans } from '@lingui/macro'

const { Title, Text } = Typography

const ProhibitivePolicies = ({ bansOnPlastic, limitsPlastic, country }) => {
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
        <strong style={{ color: '#020A5B' }}>
          {decodeURIComponent(country)}
        </strong>{' '}
        <Trans>
          {' '}
          has implemented the following prohibitive regulatory policy
          instruments on plastics:
        </Trans>
        <Tooltip title={t`See the global dataset`}>
          <a
            href={`${baseUrl}/data/maps?categoryId=governance-and-regulations&subcategoryId=prohibitive-regulatory-instruments`}
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
            count: limitsPlastic,
            text: t`Regulatory instruments on limiting plastics use`,
          },
          {
            count: bansOnPlastic,
            text: t`Regulatory instruments on plastics bans`,
          },
          {
            count: 2,
            text:
              t`Regulatory instruments on irresponsible handling of plastics`,
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
                minWidth: '5%',
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

export default ProhibitivePolicies
