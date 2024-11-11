import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import useLayerInfo from '../../hooks/useLayerInfo'

const { Title, Text } = Typography

const SenegalPolicyComponent = ({ cashReturn, subsidies, country }) => (
  <Card
    style={{
      width: '130%',
      height: '300px',
      borderRadius: '12px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Row>
      <Col span={24}>
        <Title
          level={4}
          style={{ color: '#1B2738', fontSize: '18px', fontWeight: 'normal' }}
        >
          <strong>{country}</strong> has implemented the following economic
          instruments on plastics:
          <Tooltip title="Information about implemented instruments on plastics">
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#8E44AD' }} />
          </Tooltip>
        </Title>
      </Col>
    </Row>
    <Row gutter={16} justify="space-around">
      <Col span={8}>
        <Card
          bordered={false}
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Title level={1} style={{ color: '#6236FF' }}>
            {cashReturn}
          </Title>
          <Text>cash for return schemes</Text>
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
          <Title level={1} style={{ color: '#6236FF' }}>
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
          <Title level={1} style={{ color: '#6236FF' }}>
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

// Component for France's policies and regulations section
const FrancePolicyComponent = ({
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
      width: '65%',
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
      <Card
        bordered={false}
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Title level={1} style={{ color: '#6236FF' }}>
          {education}
        </Title>
        <Text>
          policies that include initiatives on education regarding plastics
        </Text>
      </Card>
      <Card
        bordered={false}
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Title level={1} style={{ color: '#6236FF' }}>
          {labeling}
        </Title>
        <Text>
          policies on labelling of plastics to increase information to the
          public
        </Text>
      </Card>
      <Card
        bordered={false}
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Title level={1} style={{ color: '#6236FF' }}>
          {bansOnPlastic}
        </Title>
        <Text>
          policies with bans on plastics, aiming to fully or partially prohibit
          a specific type of plastic at any stage(s) in the life cycle
        </Text>
      </Card>
      <Card
        bordered={false}
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Title level={1} style={{ color: '#6236FF' }}>
          {limitsPlastic}
        </Title>
        <Text>
          prohibitive regulations limiting plastics aiming at prescribing a
          maximum amount, quantity or number of plastic allowed at any stage(s)
          in the life cycle
        </Text>
      </Card>
      <Card
        bordered={false}
        style={{
          marginBottom: 8,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Title level={1} style={{ color: '#6236FF' }}>
          {plasticLeakage}
        </Title>
        <Text>
          affirmative regulations to reduce plastic leakage in the country,
          fostering the use of technology and mechanical interventions to
          capture litter
        </Text>
      </Card>
    </div>
  </Card>
)

const PolicyComponent = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()
  const [cashReturn, setCashReturn] = useState(0)
  const [subsidies, setSubsidies] = useState(0)
  const [education, setEducation] = useState(0)
  const [labeling, setLabeling] = useState(0)
  const [bansOnPlastic, setBansOnPlastic] = useState(0)
  const [limitsPlastic, setLimitsOnPlastic] = useState(0)
  const [plasticLeakage, setPlasticLeakage] = useState(0)

  useEffect(() => {
    if (loading || !layers.length || !country) return

    const cashReturnLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId === 'Cash_for_return_schemes_WFL1'
    )
    const subsidiesLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId ===
        'Subsidies_to_avoid_the_use_of_plastics_V2_WFL1'
    )
    const labelingLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId ===
        'Policies_on_plastic_labelling_5_10_24_WFL1'
    )
    const educationLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId === 'plastic_eduaction_policy_WFL1'
    )

    const bansOnPlasticLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId ===
        'Policies_with_bans_on_plastic_6_10_24_WFL1'
    )

    const limitsOnPlasticLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId ===
        'Policies_with_limits_on_plastic_6_10_24_WFL1'
    )
    const plasticLeakageLayer = layers.find(
      (layer) =>
        layer.attributes.arcgislayerId ===
        'Regulations_on_new_practices_to_reduce_plastic_leakage_WFL1'
    )

    if (cashReturnLayer) {
      const filteredCashReturn = cashReturnLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredCashReturn.length) {
        setCashReturn(filteredCashReturn[0].Value)
      }
    }
    if (plasticLeakageLayer) {
      const filteredPlasticLeakage = plasticLeakageLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredPlasticLeakage.length) {
        setPlasticLeakage(filteredPlasticLeakage[0].Value)
      }
    }

    if (limitsOnPlasticLayer) {
      const filteredLimitsOnPlastic = limitsOnPlasticLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredLimitsOnPlastic.length) {
        setLimitsOnPlastic(filteredLimitsOnPlastic[0].Value)
      }
    }

    if (labelingLayer) {
      const filteredLabeling = labelingLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredLabeling.length) {
        setLabeling(filteredLabeling[0].Value)
      }
    }

    if (subsidiesLayer) {
      const filteredSubsidies = subsidiesLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredSubsidies.length) {
        setSubsidies(filteredSubsidies[0].Value)
      }
    }

    if (educationLayer) {
      const filteredEducation = educationLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredEducation.length) {
        setEducation(filteredEducation[0].Value)
      }
    }

    if (bansOnPlasticLayer) {
      const filteredBansOnPlastic = bansOnPlasticLayer.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      ).sort((a, b) => b.Year - a.Year)

      if (filteredBansOnPlastic.length) {
        setBansOnPlastic(filteredBansOnPlastic[0].Value)
      }
    }
  }, [layers, loading, country])

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>
        <SenegalPolicyComponent
          cashReturn={cashReturn}
          subsidies={subsidies}
          country={country}
        />
      </div>
      <div style={{ margin: '32px 0' }} />
      <div style={{ width: '50%' }}></div>
      <FrancePolicyComponent
        cashReturn={cashReturn}
        subsidies={subsidies}
        education={education}
        labeling={labeling}
        bansOnPlastic={bansOnPlastic}
        limitsPlastic={limitsPlastic}
        plasticLeakage={plasticLeakage}
        country={country}
      />
    </div>
  )
}

export default PolicyComponent
