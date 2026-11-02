import { mount } from 'svelte'
import { setAssetPath } from '@esri/calcite-components/dist/components'
import './app.css'
import '@esri/calcite-components/components/calcite-action/customElement'
import '@esri/calcite-components/components/calcite-action-bar/customElement'
import '@esri/calcite-components/components/calcite-icon/customElement'
import '@esri/calcite-components/components/calcite-navigation/customElement'
import '@esri/calcite-components/components/calcite-navigation-logo/customElement'
import '@esri/calcite-components/components/calcite-panel/customElement'
import '@esri/calcite-components/components/calcite-shell/customElement'
import '@esri/calcite-components/components/calcite-shell-panel/customElement'
import App from './App.svelte'
import { applyColorMode, APP_COLOR_MODE } from './lib/config/theme'

setAssetPath(`${import.meta.env.BASE_URL}calcite/`)
applyColorMode(APP_COLOR_MODE)

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
