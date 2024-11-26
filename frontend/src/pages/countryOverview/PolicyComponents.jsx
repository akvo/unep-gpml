import React, { useEffect, useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../hooks/useLayerInfo'
import { getBaseUrl } from '../../utils/misc'

const EconomicInstrumentsComponent = lazy(() =>
  import('./partials/EconomicInstrumentsComponent')
)
const ProhibitivePolicies = lazy(() => import('./ProhibitivePolicies'))
const PoliciesAndRegulationsComponent = lazy(() =>
  import('./partials/PoliciesAndRegulationsComponent')
)
const baseUrl = getBaseUrl()
const cardStyle = {
  backgroundColor: 'transparent',
  marginBottom: '20px',
}

const containerStyle = {
  width: '130%',
  height: '50%',
  display: 'flex',
  justifyContent: 'space-between',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
}

const PolicyComponent = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()

  const [policyData, setPolicyData] = useState({
    cashReturn: 0,
    subsidies: 0,
    education: 0,
    labeling: 0,
    bansOnPlastic: 0,
    limitsPlastic: 0,
    plasticLeakage: 0,
  })

  useEffect(() => {
    if (loading || !layers.length || !country) return

    const getLatestValue = (layerId) => {
      const layer = layers.find(
        (layer) => layer.attributes.arcgislayerId === layerId
      )
      if (layer) {
        const filteredData = layer.attributes.ValuePerCountry.filter(
          (item) => item.CountryName === country
        ).sort((a, b) => b.Year - a.Year)
        return filteredData.length ? filteredData[0].Value : 0
      }
      return 0
    }

    setPolicyData({
      cashReturn: getLatestValue('Cash_for_return_schemes_WFL1'),
      subsidies: getLatestValue(
        'Subsidies_to_avoid_the_use_of_plastics_V2_WFL1'
      ),
      education: getLatestValue('plastic_eduaction_policy_WFL1'),
      labeling: getLatestValue('Policies_on_plastic_labelling_5_10_24_WFL1'),
      bansOnPlastic: getLatestValue(
        'Policies_with_bans_on_plastic_6_10_24_WFL1'
      ),
      limitsPlastic: getLatestValue(
        'Policies_with_limits_on_plastic_6_10_24_WFL1'
      ),
      regulatoryInstrumentsOnInnovation: getLatestValue(
        'Regulations_on_new_practices_to_reduce_plastic_leakage_WFL1'
      ),
      plasticLeakage: getLatestValue(
        'Regulations_on_avoiding_plastic_leakage_WFL1'
      ),
      disincentives: getLatestValue(
        'Regulations_to_disincentivize_plastic_use_V2_WFL1'
      ),
      dataCollection: getLatestValue(
        'Policies_on_plastic_data_collection_6_10_24_WFL1'
      ),
      dataCollection: getLatestValue(
        'Plans_and_commitments_to_reduce_plastic_6_10_24_WFL1'
      ),
      irresponsibleHandling: getLatestValue(
        'Regulations_on_responsible_handling_of_plastic_V2_WFL1'
      ),
    })
  }, [layers, loading, country])

  return (
    <div style={{ width: '70%' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <div style={{ ...cardStyle, marginBottom: '2px' }}>
          <EconomicInstrumentsComponent
            cashReturn={policyData.cashReturn}
            subsidies={policyData.subsidies}
            disincentives={policyData.disincentives}
            education={policyData.education}
            dataCollection={policyData.dataCollection}
            labeling={policyData.labeling}
            country={country}
          />
        </div>

        <div style={{ flex: 1, ...containerStyle }}>
          <div style={{ flex: 1, ...cardStyle }}>
            <div style={headerStyle}></div>
            <PoliciesAndRegulationsComponent
              country={country}
              baseUrl={baseUrl}
              plasticLeakage={policyData.plasticLeakage}
              regulatoryInstrumentsOnInnovation={
                policyData.regulatoryInstrumentsOnInnovation
              }
              irresponsibleHandling={policyData.irresponsibleHandling}
            />
          </div>

          <div style={{ flex: 1, ...cardStyle }}>
            <div style={headerStyle}></div>
            <ProhibitivePolicies
              bansOnPlastic={policyData.bansOnPlastic}
              limitsPlastic={policyData.limitsPlastic}
              country={country}
            />
          </div>
        </div>
      </Suspense>
    </div>
  )
}

export default PolicyComponent
