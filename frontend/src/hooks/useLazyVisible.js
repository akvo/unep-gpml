import { useState, useRef, useEffect } from 'react'

const useLazyVisible = (rootMargin = '200px') => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || isVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [rootMargin, isVisible])

  return { ref, isVisible }
}

export default useLazyVisible
