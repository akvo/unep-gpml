import { useEffect, useState } from 'react'
import { getLegends } from '../services/legends'

const useLegends = (layerId, arcgisMapId, layerMappingId) => {
  const [legends, setLegends] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLegends = async () => {
      setLoading(true)
      const legends = await getLegends(layerId, arcgisMapId, layerMappingId)
      setLegends(legends)
      setLoading(false)
    }
    fetchLegends()
  }, [layerId])

  return { legends, loading }
}

export default useLegends
