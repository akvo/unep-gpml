import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const useCountryData = () => {
  const router = useRouter()
  const { countryCode } = router.query
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!countryCode) {
      setLoading(false)
      return
    }

    setLoading(true)
    axios
      .get(`/data/countries/${countryCode}.json`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [countryCode])

  return { data, loading }
}

export default useCountryData
