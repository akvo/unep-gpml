import { useState, useEffect } from 'react'

let globalLayer = null
let listeners = []

export function setGlobalLayer(layer) {
  globalLayer = layer
  listeners.forEach((fn) => fn(globalLayer))
}

export function useGlobalLayer() {
  const [layer, setLayer] = useState(globalLayer)

  useEffect(() => {
    const update = (newLayer) => setLayer(newLayer)
    listeners.push(update)
    return () => {
      listeners = listeners.filter((fn) => fn !== update)
    }
  }, [])

  return layer
}
