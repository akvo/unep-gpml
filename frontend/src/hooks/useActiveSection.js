import { useState, useRef, useEffect, useCallback } from 'react'

const useActiveSection = (sectionKeys = []) => {
  const [activeSection, setActiveSection] = useState(sectionKeys[0] || null)
  const sectionRefs = useRef({})
  const observerRef = useRef(null)

  // Keep activeSection default in sync when sectionKeys change
  useEffect(() => {
    if (sectionKeys.length > 0 && !activeSection) {
      setActiveSection(sectionKeys[0])
    }
  }, [sectionKeys])

  // Set up observer
  useEffect(() => {
    if (sectionKeys.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          const key = visible[0].target.getAttribute('data-section')
          if (key) setActiveSection(key)
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )

    observerRef.current = observer

    // Observe after a tick so section refs have been registered
    const timer = setTimeout(() => {
      const refs = sectionRefs.current
      sectionKeys.forEach((key) => {
        const el = refs[key]
        if (el) observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [sectionKeys])

  const scrollToSection = useCallback((key) => {
    const el = sectionRefs.current[key]
    if (el) {
      setActiveSection(key)
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const registerRef = useCallback(
    (key, el) => {
      if (el) {
        sectionRefs.current[key] = el
        // If observer already exists, observe this element
        if (observerRef.current) {
          observerRef.current.observe(el)
        }
      }
    },
    []
  )

  return { activeSection, scrollToSection, registerRef }
}

export default useActiveSection
