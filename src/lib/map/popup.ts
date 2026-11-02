export interface PopupField {
  field: string
  label: string
  format?: string
}

export interface PopupConfig {
  fields: PopupField[]
}

export interface PopupAttribute {
  label: string
  value: string
}

const formatValue = (
  field: PopupField,
  value: unknown,
  entryLabels: Record<string, string>,
): string => {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') {
    return 'No data'
  }

  if (field.format === 'legend-label') {
    return entryLabels[String(value)] ?? String(value)
  }

  if (!['number', 'currency', 'percent'].includes(field.format ?? '')) {
    return String(value)
  }

  const number = Number(value)
  if (!Number.isFinite(number)) return 'No data'

  if (field.format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(number)
  }

  if (field.format === 'percent') {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(number / 100)
  }

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number)
}

export const formatPopupFields = (
  config: PopupConfig,
  properties: Record<string, unknown>,
  entryLabels: Record<string, string> = {},
): PopupAttribute[] => config.fields.map((field) => ({
  label: field.label,
  value: formatValue(field, properties[field.field], entryLabels),
}))

export const createPopupContent = (title: string, attributes: PopupAttribute[]): HTMLElement => {
  const content = document.createElement('section')
  content.className = 'feature-popup'

  const heading = document.createElement('h3')
  heading.className = 'feature-popup__title'
  heading.textContent = title

  const fields = document.createElement('dl')
  fields.className = 'feature-popup__fields'

  for (const attribute of attributes) {
    const row = document.createElement('div')
    const label = document.createElement('dt')
    label.textContent = attribute.label
    const value = document.createElement('dd')
    value.textContent = attribute.value
    row.append(label, value)
    fields.append(row)
  }

  content.append(heading, fields)
  return content
}