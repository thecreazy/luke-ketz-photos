// Client-side checks for graphic effects. Every effect in src/site must have a plain fallback
// (the normal <Photo>), shown when these return false and also before the JavaScript has loaded.

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const supportsWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Effects run only for visitors who did not ask for less motion and whose browser can draw them. */
export const canRunEffects = (): boolean => !prefersReducedMotion() && supportsWebGL()
