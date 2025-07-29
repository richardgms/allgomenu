'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseScrollSpyOptions {
  rootMargin?: string
  threshold?: number
  offset?: number
}

interface UseScrollSpyReturn {
  activeSection: string
  scrollToSection: (sectionId: string) => void
  registerSection: (sectionId: string, element: HTMLElement | null) => void
  unregisterSection: (sectionId: string) => void
}

/**
 * Hook para detectar qual seção está visível e permitir navegação suave
 */
export function useScrollSpy(options: UseScrollSpyOptions = {}): UseScrollSpyReturn {
  const {
    rootMargin = '-20% 0px -60% 0px',
    threshold = 0.1,
    offset = 80
  } = options

  const [activeSection, setActiveSection] = useState<string>('')
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Registrar uma seção para observação
  const registerSection = useCallback((sectionId: string, element: HTMLElement | null) => {
    if (!element) return

    sectionsRef.current.set(sectionId, element)

    // Se o observer já existe, observe o novo elemento
    if (observerRef.current) {
      observerRef.current.observe(element)
    }
  }, [])

  // Desregistrar uma seção
  const unregisterSection = useCallback((sectionId: string) => {
    const element = sectionsRef.current.get(sectionId)
    if (element && observerRef.current) {
      observerRef.current.unobserve(element)
    }
    sectionsRef.current.delete(sectionId)
  }, [])

  // Scroll suave para uma seção específica
  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionsRef.current.get(sectionId)
    if (!element) return

    const elementTop = element.offsetTop - offset
    
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })

    // Atualizar o estado ativo imediatamente para feedback visual
    setActiveSection(sectionId)
  }, [offset])

  // Configurar o Intersection Observer
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // Usar throttling para evitar atualizações excessivas
      const updateActiveSection = () => {
        // Encontrar a seção mais visível
        let mostVisibleEntry: IntersectionObserverEntry | null = null
        let maxIntersectionRatio = 0

        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio
            mostVisibleEntry = entry
          }
        })

        if (mostVisibleEntry) {
          const sectionId = mostVisibleEntry.target.id
          setActiveSection(prevActive => {
            // Só atualizar se realmente mudou
            return prevActive !== sectionId ? sectionId : prevActive
          })
        }
      }

      // Debounce rápido para performance
      const timeoutId = setTimeout(updateActiveSection, 50)
      return () => clearTimeout(timeoutId)
    }

    // Criar o observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    })

    // Observar todas as seções já registradas
    sectionsRef.current.forEach(element => {
      observerRef.current?.observe(element)
    })

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [rootMargin, threshold])

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      sectionsRef.current.clear()
    }
  }, [])

  return {
    activeSection,
    scrollToSection,
    registerSection,
    unregisterSection
  }
}

/**
 * Hook simplificado para auto-registro de seções
 */
export function useScrollSpySection(sectionId: string, scrollSpy: UseScrollSpyReturn) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (element) {
      // Definir o ID no elemento se não estiver definido
      if (!element.id) {
        element.id = sectionId
      }
      
      scrollSpy.registerSection(sectionId, element)
      
      return () => {
        scrollSpy.unregisterSection(sectionId)
      }
    }
  }, [sectionId, scrollSpy])

  return elementRef
}