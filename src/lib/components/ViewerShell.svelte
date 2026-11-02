<script lang="ts">
  import AppHeader from "./AppHeader.svelte";
  import LeftPanel from "./LeftPanel.svelte";
  import RightPanel from "./RightPanel.svelte";
  import ViewerCanvas from "./ViewerCanvas.svelte";
  import type { LegendLayer } from "../map/legend";
  import { DEFAULT_DATASET_ID } from "../map/datasets";
  import type { FeatureLayerLoadingMode } from "../map/feature-layer";

  let leftCollapsed = $state(false);
  let rightCollapsed = $state(false);
  let legendLayers = $state<LegendLayer[]>([]);
  let selectedDatasetId = $state<string | null>(DEFAULT_DATASET_ID);
  let showTileBoundaries = $state(false);
  let featureLayerLoadingMode = $state<FeatureLayerLoadingMode>("default");
  let zoomRequest = $state<{ value: number } | null>(null);
</script>

<calcite-shell>
  <div slot="header" class="header-slot">
    <AppHeader />
  </div>

  <calcite-shell-panel slot="panel-start" width="m" collapsed={leftCollapsed}>
    <calcite-action-bar slot="action-bar" expand-toggle-disabled>
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <calcite-action
        role="button"
        tabindex="0"
        icon={leftCollapsed ? "chevrons-right" : "chevrons-left"}
        text={leftCollapsed ? "Expand controls" : "Collapse controls"}
        onclick={() => (leftCollapsed = !leftCollapsed)}
      ></calcite-action>
    </calcite-action-bar>
    <LeftPanel
      {selectedDatasetId}
      {showTileBoundaries}
      {featureLayerLoadingMode}
      onDatasetChange={(datasetId) => {
        selectedDatasetId = datasetId;
      }}
      onTileBoundariesChange={(checked) => {
        showTileBoundaries = checked;
      }}
      onFeatureLayerLoadingModeChange={(mode) => {
        featureLayerLoadingMode = mode;
      }}
      onZoomConfirm={(zoom) => {
        zoomRequest = { value: zoom };
      }}
    />
  </calcite-shell-panel>

  <ViewerCanvas
    {selectedDatasetId}
    {showTileBoundaries}
    {featureLayerLoadingMode}
    {zoomRequest}
    onLegendChange={(layers) => {
      legendLayers = layers;
    }}
  />

  <calcite-shell-panel slot="panel-end" width="m" collapsed={rightCollapsed}>
    <calcite-action-bar slot="action-bar" expand-toggle-disabled>
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <calcite-action
        role="button"
        tabindex="0"
        icon={rightCollapsed ? "chevrons-left" : "chevrons-right"}
        text={rightCollapsed ? "Expand legend" : "Collapse legend"}
        onclick={() => (rightCollapsed = !rightCollapsed)}
      ></calcite-action>
    </calcite-action-bar>
    <RightPanel layers={legendLayers} />
  </calcite-shell-panel>
</calcite-shell>

<style>
  calcite-shell {
    height: 100dvh;
  }

  .header-slot {
    display: contents;
  }

  calcite-shell-panel {
    --calcite-shell-panel-width: clamp(13rem, 18vw, 20rem);
  }
</style>
