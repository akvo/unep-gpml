import { useEffect, useState } from 'react'
import { getLegends } from '../services/legends'

const useLegends = (layerId) => {
  const [legends, setLegends] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLegends = async () => {
      setLoading(true)
      const legends = await getLegends(layerId)
      setLegends(legends)
      setLoading(false)
    }
    fetchLegends()
  }, [layerId])

  return { legends, loading }
}

export default useLegends
