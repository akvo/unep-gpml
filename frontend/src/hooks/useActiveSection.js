import { useState, useRef, useEffect, useCallback } from 'react'

const useActiveSection = (sectionKeys = []) => {
  const [activeSection, setActiveSection] = useState(sectionKeys[0] || null)
  const sectionRefs = useRef({})

  useEffect(() => {
    if (sectionKeys.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveSection(visible[0].target.getAttribute('data-section'))
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    const refs = sectionRefs.current
    sectionKeys.forEach((key) => {
      const el = refs[key]
      if (el) observer.observe(el)
    })

    return () => {
      sectionKeys.forEach((key) => {
        const el = refs[key]
        if (el) observer.unobserve(el)
      })
    }
  }, [sectionKeys])

  const scrollToSection = useCallback((key) => {
    const el = sectionRefs.current[key]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const registerRef = useCallback((key, el) => {
    if (el) {
      sectionRefs.current[key] = el
    }
  }, [])

  return { activeSection, scrollToSection, registerRef }
}

export default useActiveSection
