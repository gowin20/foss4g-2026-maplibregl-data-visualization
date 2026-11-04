import type { StyleSpecification } from 'maplibre-gl'

const credentialKeys = new Set([
  'token',
  'access_token',
  'accesstoken',
  'api_key',
  'apikey',
  'authorization',
])

export const formatStyleJson = (style: StyleSpecification): string => JSON.stringify(
  style,
  (key, value: unknown) => {
    if (credentialKeys.has(key.toLowerCase()) && value !== undefined) return 'REDACTED'
    if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return value

    try {
      const url = new URL(value)
      let changed = false

      for (const name of [...url.searchParams.keys()]) {
        if (!credentialKeys.has(name.toLowerCase())) continue
        url.searchParams.set(name, 'REDACTED')
        changed = true
      }

      return changed ? url.toString() : value
    } catch {
      return value
    }
  },
  2,
)