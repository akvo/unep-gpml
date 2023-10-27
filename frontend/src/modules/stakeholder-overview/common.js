import { useRouter } from 'next/router'

const useQuery = () => {
  const router = useRouter()
  const { query } = router

  const ret = {
    country: [],
    networkType: [],
    tag: [],
    page: [],
    geoCoverageType: [],
    transnational: [],
    representativeGroup: [],
    seeking: [],
    offering: [],
  }

  for (let key in ret) {
    if (query[key]) {
      ret[key] = Array.isArray(query[key])
        ? query[key]
        : query[key].split(',').filter((it) => it !== '')
    }
  }

  return ret
}

export { useQuery }
