import * as React from "react"

const MOBILE_BREAKPOINT = 1024 // lg breakpoint do Tailwind

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Initial check
    checkMobile()
    
    // Add event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    mql.addEventListener("change", handleChange)
    
    return () => mql.removeEventListener("change", handleChange)
  }, [])

  // Return undefined during SSR, false for desktop, true for mobile
  return isMobile
}
