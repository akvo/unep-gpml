import { useState } from 'react'
import dynamic from 'next/dynamic'

const useDynamicSVGImport = (name, options = {}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { onCompleted, onError } = options

  console.log(name)

  const DynamicComponent = dynamic(
    import(`../../images/${name}.svg`).then(
      (module) => {
        if (onCompleted) {
          onCompleted(name, module)
        }
        return module
      },
      (err) => {
        if (onError) {
          onError(err)
        }
        setError(err)
        return null
      }
    ),
    {
      loading: () => {
        setLoading(true)
        return null
      },
      loaded: () => {
        console.log('loaded')
        setLoading(false)
      },
      onError: (err) => {
        setError(err)
      },
    }
  )

  return { error, loading, SvgIcon: DynamicComponent }
}

export const Icon = ({ name, onCompleted, onError, ...rest }) => {
  const { error, loading, SvgIcon } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
  })

  if (error) {
    return <span>Error: {error.message}</span>
  }
  if (loading) {
    return <span>Loading...</span>
  }
  if (SvgIcon) {
    return <SvgIcon {...rest} />
  }
  return null
}
