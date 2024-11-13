import React from 'react'
import { Card, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

const PoliciesAndRegulationsComponent = ({
  cashReturn,
  subsidies,
  education,
  labeling,
  bansOnPlastic,
  limitsPlastic,
  plasticLeakage,
  country,
}) => (
  <Card
    style={{
      width: '85%',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Title
      level={4}
      style={{ color: '#1B2738', fontSize: '18px', fontWeight: 'normal' }}
    >
      <strong> {country}</strong> has adopted the following policies and
      regulations pertaining to use and disposal of plastics:
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
        <Title level={1} style={{ color: '#6236FF' }}>
          {education}
        </Title>
        <Text style={{ paddingLeft: '35px', paddingTop: '8px' }}>
          policies that include initiatives on education regarding plastics
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
        <Title level={1} style={{ color: '#6236FF' }}>
          {labeling}
        </Title>
        <Text style={{ paddingLeft: '35px', paddingTop: '8px' }}>
          policies on labelling of plastics to increase information to the
          public
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
        <Title level={1} style={{ color: '#6236FF' }}>
          {bansOnPlastic}
        </Title>
        <Text style={{ paddingLeft: '35px', paddingTop: '8px' }}>
          policies with bans on plastics, aiming to fully or partially prohibit
          a specific type of plastic at any stage(s) in the life cycle
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
        <Title level={1} style={{ color: '#6236FF' }}>
          {limitsPlastic}
        </Title>
        <Text style={{ paddingLeft: '35px', paddingTop: '8px' }}>
          prohibitive regulations limiting plastics aiming at prescribing a
          maximum amount, quantity or number of plastic allowed at any stage(s)
          in the life cycle
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
        <Title level={1} style={{ color: '#6236FF' }}>
          {plasticLeakage}
        </Title>
        <Text style={{ paddingLeft: '35px', paddingTop: '8px' }}>
          affirmative regulations to reduce plastic leakage in the country,
          fostering the use of technology and mechanical interventions to
          capture litter
        </Text>
      </div>
    </div>
  </Card>
)
export default PoliciesAndRegulationsComponent
