import React, { useEffect, useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../hooks/useLayerInfo'

const EconomicInstrumentsComponent = lazy(() =>
  import('./partials/EconomicInstrumentsComponent')
)
const PoliciesAndRegulationsComponent = lazy(() =>
  import('./partials/PoliciesAndRegulationsComponent')
)

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
      plasticLeakage: getLatestValue(
        'Regulations_on_new_practices_to_reduce_plastic_leakage_WFL1'
      ),
    })
  }, [layers, loading, country])

  return (
    <div style={{ width: '100%' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <div style={{ width: '100%' }}>
          <EconomicInstrumentsComponent
            cashReturn={policyData.cashReturn}
            subsidies={policyData.subsidies}
            country={country}
          />
        </div>
        <div style={{ margin: '5% 0' }} />
        <div style={{ width: '50%' }}></div>
        <PoliciesAndRegulationsComponent
          cashReturn={policyData.cashReturn}
          subsidies={policyData.subsidies}
          education={policyData.education}
          labeling={policyData.labeling}
          bansOnPlastic={policyData.bansOnPlastic}
          limitsPlastic={policyData.limitsPlastic}
          plasticLeakage={policyData.plasticLeakage}
          country={country}
        />
      </Suspense>
    </div>
  )
}

export default PolicyComponent
