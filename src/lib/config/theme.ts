export type AppColorMode = 'light' | 'dark'

export const APP_COLOR_MODE: AppColorMode =
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

export const applyColorMode = (mode: AppColorMode) => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.remove('calcite-mode-light', 'calcite-mode-dark')
  root.classList.add(`calcite-mode-${mode}`)
  root.style.colorScheme = mode
}