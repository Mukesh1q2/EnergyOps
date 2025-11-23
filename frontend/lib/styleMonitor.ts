/**
 * Style Loading Monitor
 * Detects and handles CSS loading failures
 */

export interface StyleMonitorConfig {
  onStyleLoadError?: (href: string) => void
  onStyleLoadSuccess?: (href: string) => void
  retryAttempts?: number
  retryDelay?: number
}

/**
 * Monitor stylesheet loading
 */
export function monitorStylesheets(config?: StyleMonitorConfig): void {
  if (typeof window === 'undefined') {
    return
  }

  const {
    onStyleLoadError,
    onStyleLoadSuccess,
    retryAttempts = 3,
    retryDelay = 1000,
  } = config || {}

  // Monitor existing stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
  
  stylesheets.forEach((link) => {
    const href = link.getAttribute('href')
    if (!href) return

    // Check if stylesheet loaded successfully
    const checkStylesheet = () => {
      try {
        // Try to access stylesheet rules
        const sheet = (link as HTMLLinkElement).sheet
        if (sheet && sheet.cssRules) {
          console.log('[StyleMonitor] Stylesheet loaded:', href)
          onStyleLoadSuccess?.(href)
        }
      } catch (error) {
        console.error('[StyleMonitor] Stylesheet failed to load:', href, error)
        onStyleLoadError?.(href)
        
        // Retry loading
        retryStylesheet(link as HTMLLinkElement, retryAttempts, retryDelay)
      }
    }

    // Check after a short delay
    setTimeout(checkStylesheet, 100)
  })

  // Monitor new stylesheets added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeName === 'LINK' &&
          (node as HTMLLinkElement).rel === 'stylesheet'
        ) {
          const link = node as HTMLLinkElement
          const href = link.getAttribute('href')
          
          link.addEventListener('load', () => {
            console.log('[StyleMonitor] New stylesheet loaded:', href)
            onStyleLoadSuccess?.(href || '')
          })
          
          link.addEventListener('error', () => {
            console.error('[StyleMonitor] New stylesheet failed:', href)
            onStyleLoadError?.(href || '')
            retryStylesheet(link, retryAttempts, retryDelay)
          })
        }
      })
    })
  })

  observer.observe(document.head, {
    childList: true,
    subtree: true,
  })
}

/**
 * Retry loading a stylesheet
 */
function retryStylesheet(
  link: HTMLLinkElement,
  attempts: number,
  delay: number
): void {
  if (attempts <= 0) {
    console.error('[StyleMonitor] Max retry attempts reached for:', link.href)
    return
  }

  setTimeout(() => {
    const href = link.getAttribute('href')
    if (!href) return

    console.log('[StyleMonitor] Retrying stylesheet:', href, `(${attempts} attempts left)`)

    // Create new link element with cache-busting parameter
    const newLink = document.createElement('link')
    newLink.rel = 'stylesheet'
    newLink.href = href.includes('?')
      ? `${href}&retry=${Date.now()}`
      : `${href}?retry=${Date.now()}`

    newLink.addEventListener('load', () => {
      console.log('[StyleMonitor] Retry successful:', href)
      // Remove old link
      link.remove()
    })

    newLink.addEventListener('error', () => {
      console.error('[StyleMonitor] Retry failed:', href)
      retryStylesheet(newLink, attempts - 1, delay)
    })

    // Insert new link after the old one
    link.parentNode?.insertBefore(newLink, link.nextSibling)
  }, delay)
}

/**
 * Check if all stylesheets are loaded
 */
export async function checkStylesheetsLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
  
  const checks = Array.from(stylesheets).map((link) => {
    return new Promise<boolean>((resolve) => {
      try {
        const sheet = (link as HTMLLinkElement).sheet
        if (sheet && sheet.cssRules) {
          resolve(true)
        } else {
          resolve(false)
        }
      } catch {
        resolve(false)
      }
    })
  })

  const results = await Promise.all(checks)
  return results.every((result) => result)
}

/**
 * Force reload all stylesheets
 */
export function reloadAllStylesheets(): void {
  if (typeof window === 'undefined') {
    return
  }

  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
  
  stylesheets.forEach((link) => {
    const href = link.getAttribute('href')
    if (href) {
      const newHref = href.includes('?')
        ? `${href}&reload=${Date.now()}`
        : `${href}?reload=${Date.now()}`
      
      link.setAttribute('href', newHref)
    }
  })

  console.log('[StyleMonitor] All stylesheets reloaded')
}
