import type { FeatureLayer } from '@esri/maplibre-arcgis'
import pointOnFeature from '@turf/point-on-feature'
import type { GeoJSONSource, GeoJSONSourceSpecification, Map } from 'maplibre-gl'
import type { DataLayerConfig } from './datasets'

export type FeatureLayerLoadingMode = FeatureLayer['loadingMode']

export interface FeatureLayerScope {
  map: Map
  dispose: () => void
}

export const pointFeatureData = (
  data: GeoJSONSourceSpecification['data'],
): GeoJSONSourceSpecification['data'] => {
  if (!data || typeof data !== 'object' || data.type !== 'FeatureCollection') return data

  return {
    ...data,
    features: data.features.flatMap((feature) => {
      if (!feature.geometry) return []

      const point = pointOnFeature(feature.geometry)
      point.properties = feature.properties
      if (feature.id !== undefined) point.id = feature.id
      return [point]
    }),
  }
}

export const createFeatureLayerScope = (map: Map, config: DataLayerConfig): FeatureLayerScope => {
  let disposed = false
  const cleanups: (() => void)[] = []
  const sources = new WeakMap<GeoJSONSource, GeoJSONSource>()

  const scopedMap = new Proxy(map, {
    get(target, property) {
      if (property === 'on') {
        return (...args: unknown[]) => {
          if (disposed) return target

          if (typeof args[0] === 'string' && typeof args[1] === 'function') {
            cleanups.push(() => Reflect.apply(target.off, target, args))
          }

          return Reflect.apply(target.on, target, args)
        }
      }

      if (property === 'getSource') {
        return (id: string) => {
          if (disposed) return undefined

          const source = target.getSource(id)
          if (config.geometryTransform !== 'point-on-feature' || source?.type !== 'geojson') {
            return source
          }

          const geojsonSource = source as GeoJSONSource
          const cached = sources.get(geojsonSource)
          if (cached) return cached

          const scopedSource = new Proxy(geojsonSource, {
            get(sourceTarget, sourceProperty) {
              if (sourceProperty === 'setData') {
                return (data: GeoJSONSourceSpecification['data']) => disposed
                  ? Promise.resolve()
                  : sourceTarget.setData(pointFeatureData(data))
              }

              const value = Reflect.get(sourceTarget, sourceProperty, sourceTarget)
              return typeof value === 'function' ? value.bind(sourceTarget) : value
            },
          })

          sources.set(geojsonSource, scopedSource)
          return scopedSource
        }
      }

      const value = Reflect.get(target, property, target)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })

  return {
    map: scopedMap,
    dispose: () => {
      disposed = true
      for (const cleanup of cleanups.splice(0)) cleanup()
    },
  }
}