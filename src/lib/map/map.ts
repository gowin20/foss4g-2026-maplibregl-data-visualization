import {
  Map as MapLibreMap,
  Popup,
  type CircleLayerSpecification,
  type FilterSpecification,
  type FillLayerSpecification,
  type LineLayerSpecification,
} from 'maplibre-gl'
import { BasemapStyle, FeatureLayer, VectorTileLayer } from '@esri/maplibre-arcgis'
import cityBoundaryConfig from './layers/CityBoundary.json'
import { datasets, type DataLayerConfig, type DatasetConfig } from './datasets'
import {
  createFeatureLayerScope,
  pointFeatureData,
  type FeatureLayerLoadingMode,
  type FeatureLayerScope,
} from './feature-layer'
import { createLegendLayer, type LegendLayer } from './legend'
import { createPopupContent, formatPopupFields } from './popup'

const DEFAULT_BASEMAP_STYLE = 'arcgis/human-geography'

export interface MapController {
  map: MapLibreMap
  selectDataset: (datasetId: string | null, loadingMode?: FeatureLayerLoadingMode) => Promise<void>
}

interface LoadedDataLayer {
  config: DataLayerConfig
  layer: FeatureLayer | VectorTileLayer
  scope?: FeatureLayerScope
}

export const createMap = (
  container: HTMLElement,
  token: string,
  dataServiceToken?: string,
  onLegendChange?: (layers: LegendLayer[]) => void,
): MapController => {
  const map = new MapLibreMap({
    container,
    center: [-121.4944, 38.5816],
    zoom: 10,
  })

  let boundaryLegend: LegendLayer | undefined
  let datasetLegends: LegendLayer[] = []
  const updateLegend = () => {
    onLegendChange?.(
      [boundaryLegend, ...datasetLegends].filter((layer): layer is LegendLayer => Boolean(layer)),
    )
  }

  let removed = false
  let ready = false
  let selectedDatasetId: string | null = null
  let selectionVersion = 0
  let featureLayerLoadingMode: FeatureLayerLoadingMode = 'default'
  let loadingDatasetId: string | null = null
  let pendingScopes: FeatureLayerScope[] = []
  let activeDataset: {
    id: string
    config: DatasetConfig
    layers: LoadedDataLayer[]
    interactiveLayerIds: string[]
  } | undefined
  let popup: Popup | undefined

  const closePopup = () => {
    popup?.remove()
    popup = undefined
  }

  const removeDataLayers = (layers: LoadedDataLayer[]) => {
    for (const entry of layers) entry.scope?.dispose()

    for (const entry of [...layers].reverse()) {
      for (const layer of [...entry.layer.layers].reverse()) {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id)
      }
    }

    for (const entry of layers) {
      for (const sourceId of Object.keys(entry.layer.sources)) {
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }
    }
  }

  const clearDataset = () => {
    closePopup()
    map.getCanvas().style.cursor = ''

    if (activeDataset) removeDataLayers(activeDataset.layers)

    activeDataset = undefined
    datasetLegends = []
    updateLegend()
  }

  const selectDataset = async (
    datasetId: string | null,
    loadingMode: FeatureLayerLoadingMode = featureLayerLoadingMode,
  ): Promise<void> => {
    if (removed) return

    const dataset = datasets.find((config) => config.id === datasetId)
    const configs = dataset ? [...(dataset.contextLayers ?? []), dataset] : []
    const sameSelection = selectedDatasetId === datasetId
    const reloadFeatures = loadingMode !== featureLayerLoadingMode
      && configs.some((config) => config.type === 'feature')
    const alreadyRequested = datasetId !== null
      && (activeDataset?.id === datasetId || loadingDatasetId === datasetId)

    featureLayerLoadingMode = loadingMode
    if (sameSelection && alreadyRequested && !reloadFeatures) return

    selectedDatasetId = datasetId
    const version = ++selectionVersion
    const retainedLayers = sameSelection && activeDataset?.id === datasetId
      ? activeDataset.layers.filter((entry) => entry.config.type !== 'feature')
      : []

    for (const scope of pendingScopes) scope.dispose()
    pendingScopes = []
    loadingDatasetId = null

    if (retainedLayers.length && activeDataset && dataset) {
      closePopup()
      map.getCanvas().style.cursor = ''
      removeDataLayers(activeDataset.layers.filter((entry) => !retainedLayers.includes(entry)))
      activeDataset.layers = retainedLayers
      activeDataset.interactiveLayerIds = retainedLayers.find((entry) => entry.config === dataset)
        ?.layer.layers.map((layer) => layer.id) ?? []
      datasetLegends = [dataset, ...(dataset.contextLayers ?? [])]
        .filter((config) => retainedLayers.some((entry) => entry.config === config))
        .map(createLegendLayer)
      updateLegend()
    } else {
      clearDataset()
    }

    if (!ready || !dataServiceToken || !dataset) return

    const scopes: FeatureLayerScope[] = []
    pendingScopes = scopes
    loadingDatasetId = dataset.id

    try {
      const loadedLayers = await Promise.all(configs.map(async (config): Promise<LoadedDataLayer> => {
        const retained = retainedLayers.find((entry) => entry.config === config)
        if (retained) return retained

        if (config.type === 'feature') {
          const scope = createFeatureLayerScope(map, config)
          scopes.push(scope)
          return {
            config,
            scope,
            layer: await FeatureLayer.fromUrl(config.url, {
              token: dataServiceToken,
              loadingMode,
              map: scope.map,
            }),
          }
        }

        return {
          config,
          layer: await VectorTileLayer.fromUrl(config.url, { token: dataServiceToken }),
        }
      }))

      if (removed || version !== selectionVersion) {
        for (const scope of scopes) scope.dispose()
        return
      }

      activeDataset = {
        id: dataset.id,
        config: dataset,
        layers: loadedLayers,
        interactiveLayerIds: loadedLayers.at(-1)?.layer.layers.map((layer) => layer.id) ?? [],
      }
      for (const entry of loadedLayers) {
        if (retainedLayers.includes(entry)) continue

        const { config, layer, scope } = entry
        layer.addSourcesAndLayersTo(scope?.map ?? map, {
          transformSources: (_sourceId, source) => {
            if (config.geometryTransform !== 'point-on-feature' || source.type !== 'geojson') {
              return source
            }

            const data = source.data
            if (!data || typeof data !== 'object' || data.type !== 'FeatureCollection') {
              throw new Error('Point conversion requires an inline GeoJSON feature collection.')
            }

            return {
              ...source,
              data: pointFeatureData(data),
            }
          },
          transformLayers: (styleLayer) => {
            const filter = config.style.filter as FilterSpecification | undefined
            const filterOverride = filter === undefined ? {} : { filter }

            if (config.geometryTransform === 'point-on-feature' && styleLayer.type === 'fill') {
              return {
                id: styleLayer.id,
                source: styleLayer.source,
                type: 'circle',
                ...filterOverride,
                paint: config.style.paint as CircleLayerSpecification['paint'],
              }
            }

            if (styleLayer.type === 'circle' && config.style.type === 'circle') {
              return {
                ...styleLayer,
                ...filterOverride,
                paint: {
                  ...styleLayer.paint,
                  ...(config.style.paint as CircleLayerSpecification['paint']),
                },
              }
            }

            if (styleLayer.type !== 'fill') return styleLayer

            return {
              ...styleLayer,
              ...filterOverride,
              paint: {
                ...styleLayer.paint,
                ...(config.style.paint as FillLayerSpecification['paint']),
              },
            }
          },
        })
      }

      for (const entry of loadedLayers) {
        for (const layer of entry.layer.layers) {
          if (map.getLayer(layer.id)) map.moveLayer(layer.id)
        }
      }

      if (map.getLayer(cityBoundaryConfig.style.id)) {
        map.moveLayer(cityBoundaryConfig.style.id)
      }

      datasetLegends = [
        createLegendLayer(dataset),
        ...(dataset.contextLayers ?? []).map(createLegendLayer),
      ]
      updateLegend()
    } catch {
      for (const scope of scopes) scope.dispose()
      if (removed || version !== selectionVersion) return

      clearDataset()
      console.error('Unable to load the selected dataset.')
    } finally {
      if (version === selectionVersion) {
        loadingDatasetId = null
        pendingScopes = []
      }
    }
  }

  const getInteractiveLayerIds = () => activeDataset?.config.popup
    ? activeDataset.interactiveLayerIds.filter((id) => map.getLayer(id))
    : []

  map.on('click', (event) => {
    closePopup()
    const dataset = activeDataset?.config
    const layers = getInteractiveLayerIds()
    if (!dataset?.popup || !layers.length) return

    const feature = map.queryRenderedFeatures(event.point, { layers })[0]
    if (!feature) return

    const attributes = formatPopupFields(
      dataset.popup,
      feature.properties ?? {},
      dataset.legend.entryLabels,
    )

    popup = new Popup({
      className: 'dataset-popup',
      closeButton: true,
      closeOnClick: true,
      offset: 12,
      maxWidth: 'min(320px, calc(100% - 24px))',
    })
      .setLngLat(event.lngLat)
      .setDOMContent(createPopupContent(dataset.legend.label, attributes))
      .addTo(map)

    popup.getElement().setAttribute('role', 'dialog')
    popup.getElement().setAttribute('aria-label', dataset.legend.label)
  })

  map.on('mousemove', (event) => {
    const layers = getInteractiveLayerIds()
    const hit = layers.length && map.queryRenderedFeatures(event.point, { layers }).length > 0
    map.getCanvas().style.cursor = hit ? 'pointer' : ''
  })

  map.on('mouseout', () => {
    map.getCanvas().style.cursor = ''
  })

  map.once('remove', () => {
    removed = true
    selectionVersion += 1
    for (const scope of pendingScopes) scope.dispose()
    for (const entry of activeDataset?.layers ?? []) entry.scope?.dispose()
    pendingScopes = []
    loadingDatasetId = null
    closePopup()
    activeDataset = undefined
    boundaryLegend = undefined
    datasetLegends = []
    updateLegend()
  })

  if (dataServiceToken) {
    map.once('load', async () => {
      try {
        const cityBoundary = await FeatureLayer.fromUrl(cityBoundaryConfig.url, {
          token: dataServiceToken,
        })

        if (removed) return

        cityBoundary.addSourceTo(map)
        cityBoundary.addLayerTo(
          map,
          cityBoundaryConfig.style as Omit<LineLayerSpecification, 'source'>,
        )
        boundaryLegend = createLegendLayer(cityBoundaryConfig)
        updateLegend()
      } catch {
        console.error('Unable to load the Sacramento city boundary.')
      }
    })
  }

  map.once('load', () => {
    ready = true
    void selectDataset(selectedDatasetId)
  })

  BasemapStyle.applyStyle(map, {
    map,
    style: DEFAULT_BASEMAP_STYLE,
    token,
  })

  return { map, selectDataset }
}