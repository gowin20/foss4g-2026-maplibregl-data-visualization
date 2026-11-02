import cityParcelsConfig from './layers/CityParcels.json'
import tapestrySegmentsConfig from './layers/TapestrySegments.json'
import medianHouseholdIncomeConfig from './layers/MedianHouseholdIncome.json'
import vacantHousingUnitsConfig from './layers/VacantHousingUnits.json'
import censusBlocksConfig from './layers/CensusBlocks.json'
import rentersVsOwnersConfig from './layers/RentersVsOwners.json'
import sacramentoCountyLibrariesConfig from './layers/SacramentoCountyLibraries.json'
import parcelsFeatureConfig from './layers/ParcelsFeature.json'
import censusBlocksFeatureConfig from './layers/CensusBlocksFeature.json'
import censusTractsFeatureConfig from './layers/CensusTractsFeature.json'
import type { LegendLayerConfig } from './legend'
import type { PopupConfig } from './popup'

export interface DataLayerConfig extends LegendLayerConfig {
  url: string
  type?: string
  geometryTransform?: string
  style: LegendLayerConfig['style'] & {
    type?: string
    filter?: unknown
  }
}

export interface DatasetConfig extends DataLayerConfig {
  contextLayers?: DataLayerConfig[]
  popup?: PopupConfig
}

const datasetConfigs: DatasetConfig[] = [
  cityParcelsConfig,
  tapestrySegmentsConfig,
  medianHouseholdIncomeConfig,
  {
    ...vacantHousingUnitsConfig,
    contextLayers: [censusBlocksConfig],
  },
  rentersVsOwnersConfig,
  sacramentoCountyLibrariesConfig,
  parcelsFeatureConfig,
  censusBlocksFeatureConfig,
  censusTractsFeatureConfig,
]

export const datasets = datasetConfigs.map((config) => ({
  ...config,
  id: config.id ?? config.itemId,
}))

export const DEFAULT_DATASET_ID: string | null = null