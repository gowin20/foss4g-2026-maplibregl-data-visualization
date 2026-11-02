import { Map as MapLibreMap } from 'maplibre-gl'
import { BasemapStyle } from '@esri/maplibre-arcgis'

const DEFAULT_BASEMAP_STYLE = 'arcgis/outdoor'

export const createMap = (container: HTMLElement, token: string): MapLibreMap => {
  const map = new MapLibreMap({
    container,
    center: [0, 0],
    zoom: 1.5,
  })

  BasemapStyle.applyStyle(map, {
    map,
    style: DEFAULT_BASEMAP_STYLE,
    token,
  })

  return map
}