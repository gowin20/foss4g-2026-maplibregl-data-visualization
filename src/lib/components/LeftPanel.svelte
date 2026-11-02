<script lang="ts">
  import { datasets } from "../map/datasets";
  import type { FeatureLayerLoadingMode } from "../map/feature-layer";

  let {
    selectedDatasetId,
    onDatasetChange,
    showTileBoundaries = false,
    onTileBoundariesChange,
    featureLayerLoadingMode = "default",
    onFeatureLayerLoadingModeChange,
    onZoomConfirm,
  }: {
    selectedDatasetId: string | null;
    onDatasetChange: (datasetId: string | null) => void;
    showTileBoundaries?: boolean;
    onTileBoundariesChange: (checked: boolean) => void;
    featureLayerLoadingMode?: FeatureLayerLoadingMode;
    onFeatureLayerLoadingModeChange: (mode: FeatureLayerLoadingMode) => void;
    onZoomConfirm: (zoom: number) => void;
  } = $props();

  let zoomValue = $state("");
  const zoomLevel = $derived(zoomValue.trim() === "" ? NaN : Number(zoomValue));
  const validZoom = $derived(Number.isInteger(zoomLevel));

  const handleDatasetChange = (event: Event) => {
    const select = event.currentTarget as HTMLElement & { value: string };
    onDatasetChange(select.value || null);
  };

  const handleTileBoundariesChange = (event: Event) => {
    const checkbox = event.currentTarget as HTMLElement & { checked: boolean };
    onTileBoundariesChange(checkbox.checked);
  };

  const handleLoadingModeChange = (event: Event) => {
    const group = event.currentTarget as HTMLElement & {
      selectedItem?: { value: string };
    };
    const mode = group.selectedItem?.value;

    if (mode === "default" || mode === "snapshot" || mode === "ondemand") {
      onFeatureLayerLoadingModeChange(mode);
    }
  };

  const handleZoomInput = (event: Event) => {
    const input = event.currentTarget as HTMLElement & { value: string };
    zoomValue = input.value ?? "";
  };

  const handleZoomConfirm = (event: SubmitEvent) => {
    event.preventDefault();
    if (validZoom) onZoomConfirm(zoomLevel);
  };
</script>

<calcite-panel heading="Controls">
  <div class="controls">
    <calcite-select
      label="Dataset"
      label-text="Dataset"
      title={datasets.find((dataset) => dataset.id === selectedDatasetId)
        ?.legend.label ?? "<no current selection>"}
      oncalciteSelectChange={handleDatasetChange}
    >
      <calcite-option
        value=""
        label="<no current selection>"
        selected={selectedDatasetId === null}
      ></calcite-option>
      {#each datasets as dataset (dataset.id)}
        <calcite-option
          value={dataset.id}
          label={dataset.legend.label}
          selected={dataset.id === selectedDatasetId}
        ></calcite-option>
      {/each}
    </calcite-select>
    <calcite-radio-button-group
      name="feature-layer-loading-mode"
      label-text="Feature layer loading mode (GeoJSON)"
      layout="vertical"
      oncalciteRadioButtonGroupChange={handleLoadingModeChange}
    >
      <calcite-radio-button
        value="default"
        label-text="Default"
        checked={featureLayerLoadingMode === "default"}
      ></calcite-radio-button>
      <calcite-radio-button
        value="snapshot"
        label-text="Snapshot"
        checked={featureLayerLoadingMode === "snapshot"}
      ></calcite-radio-button>
      <calcite-radio-button
        value="ondemand"
        label-text="On-demand"
        checked={featureLayerLoadingMode === "ondemand"}
      ></calcite-radio-button>
    </calcite-radio-button-group>
    <form class="zoom-tool" aria-label="Set zoom" onsubmit={handleZoomConfirm}>
      <calcite-input-number
        name="zoom"
        label="Set zoom"
        label-text="Set zoom"
        value={zoomValue}
        step={1}
        status={zoomValue.trim() !== "" && !validZoom ? "invalid" : "idle"}
        validation-message="Enter a whole number."
        oncalciteInputNumberInput={handleZoomInput}
      ></calcite-input-number>
      <calcite-button
        type="submit"
        icon-start="check"
        title="Confirm zoom"
        disabled={!validZoom}>Confirm</calcite-button
      >
    </form>
    <calcite-checkbox
      label="Show tile boundaries"
      label-text="Show tile boundaries"
      checked={showTileBoundaries}
      oncalciteCheckboxChange={handleTileBoundariesChange}
    ></calcite-checkbox>
  </div>
</calcite-panel>

<style>
  .controls {
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

  .zoom-tool {
    display: grid;
    gap: 0.5rem;
  }

  calcite-button {
    justify-self: start;
  }

  calcite-select,
  calcite-input-number {
    display: block;
    width: 100%;
  }
</style>
