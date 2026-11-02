export interface LegendEntry {
  label: string
  color: string
}

export interface LegendGroup {
  label: string
  entries: LegendEntry[]
}

export interface LegendLayer {
  id: string
  label: string
  symbol: 'line' | 'fill' | 'circle'
  lineWidth: number
  opacity: number
  entries: LegendEntry[]
  groups?: LegendGroup[]
}

export interface LegendLayerConfig {
  id?: string
  itemId: string
  legend: {
    label: string
    symbol: string
    symbolLabel?: string
    fallbackLabel?: string
    entries?: LegendEntry[]
    entryLabels?: Record<string, string>
    groups?: {
      label: string
      entries: string[]
    }[]
  }
  style: {
    paint: Record<string, unknown>
  }
}

const collectColorEntries = (
  value: unknown,
  labels: string[],
  entries: LegendEntry[],
  fallbackColors: Set<string>,
): void => {
  if (typeof value === 'string') {
    const [label, ...qualifiers] = labels
    entries.push({
      label: qualifiers.length ? `${label} (${qualifiers.join(', ')})` : label ?? '',
      color: value,
    })
    return
  }

  if (!Array.isArray(value) || value[0] !== 'match') return

  for (let index = 2; index < value.length - 1; index += 2) {
    const matches = Array.isArray(value[index]) ? value[index] : [value[index]]

    for (const match of matches) {
      collectColorEntries(
        value[index + 1],
        match === '' ? labels : [...labels, String(match)],
        entries,
        fallbackColors,
      )
    }
  }

  const fallback = value.at(-1)

  if (typeof fallback === 'string') {
    fallbackColors.add(fallback)
  } else {
    collectColorEntries(fallback, labels, entries, fallbackColors)
  }
}

export const createLegendLayer = (config: LegendLayerConfig): LegendLayer => {
  const { legend, style } = config
  const { symbol } = legend

  if (symbol !== 'line' && symbol !== 'fill' && symbol !== 'circle') {
    throw new Error(`Unsupported legend symbol: ${symbol}`)
  }

  const color = style.paint[`${symbol}-color`]
  const entries: LegendEntry[] = [...(legend.entries ?? [])]
  const fallbackColors = new Set<string>()

  if (!legend.entries) {
    collectColorEntries(
      color,
      typeof color === 'string' ? [legend.symbolLabel ?? legend.label] : [],
      entries,
      fallbackColors,
    )
  }

  const namedEntries = entries.map((entry) => ({
    ...entry,
    label: legend.entryLabels?.[entry.label] ?? entry.label,
  }))

  const uniqueEntries = [...new Map(
    namedEntries.map((entry) => [JSON.stringify([entry.label, entry.color]), entry]),
  ).values()]

  if (!legend.entries) {
    uniqueEntries.sort((first, second) => first.label.localeCompare(second.label))
  }

  for (const fallbackColor of fallbackColors) {
    uniqueEntries.push({
      label: legend.fallbackLabel ?? 'Other / Unspecified',
      color: fallbackColor,
    })
  }

  const groupedEntries = new Set<LegendEntry>()
  const groups = legend.groups?.map((group) => {
    const labels = new Set(group.entries.map((label) => legend.entryLabels?.[label] ?? label))
    const entries = uniqueEntries.filter((entry) =>
      labels.has(entry.label) && !groupedEntries.has(entry),
    )

    for (const entry of entries) groupedEntries.add(entry)

    return { label: group.label, entries }
  }).filter((group) => group.entries.length > 0)

  if (groups) {
    const remainingEntries = uniqueEntries.filter((entry) => !groupedEntries.has(entry))

    if (remainingEntries.length) {
      const label = legend.fallbackLabel ?? 'Other / Unspecified'
      const fallbackGroup = groups.find((group) => group.label === label)

      if (fallbackGroup) fallbackGroup.entries.push(...remainingEntries)
      else groups.push({ label, entries: remainingEntries })
    }
  }

  return {
    id: config.id ?? config.itemId,
    label: legend.label,
    symbol,
    lineWidth: typeof style.paint['line-width'] === 'number' ? style.paint['line-width'] : 2,
    opacity: typeof style.paint[`${symbol}-opacity`] === 'number'
      ? style.paint[`${symbol}-opacity`] as number
      : 1,
    entries: uniqueEntries,
    groups,
  }
}