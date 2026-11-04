<script lang="ts">
  import { onMount } from "svelte";
  import { createMap, type MapController } from "../map/map";
  import { DEFAULT_DATASET_ID } from "../map/datasets";
  import type { LegendLayer } from "../map/legend";
  import type { FeatureLayerLoadingMode } from "../map/feature-layer";
  import type { StyleSpecification } from "maplibre-gl";

  let {
    selectedDatasetId = DEFAULT_DATASET_ID,
    showTileBoundaries = false,
    featureLayerLoadingMode = "default",
    zoomRequest = null,
    styleRequest = 0,
    onStyleSnapshot,
    onLegendChange,
  }: {
    selectedDatasetId?: string | null;
    showTileBoundaries?: boolean;
    featureLayerLoadingMode?: FeatureLayerLoadingMode;
    zoomRequest?: { value: number } | null;
    styleRequest?: number;
    onStyleSnapshot?: (style: StyleSpecification) => void;
    onLegendChange?: (layers: LegendLayer[]) => void;
  } = $props();

  let mapElement: HTMLDivElement;
  let mapController = $state<MapController | null>(null);

  $effect(() => {
    if (mapController) {
      void mapController.selectDataset(
        selectedDatasetId,
        featureLayerLoadingMode,
      );
    }
  });

  $effect(() => {
    if (mapController)
      mapController.map.showTileBoundaries = showTileBoundaries;
  });

  $effect(() => {
    if (mapController && zoomRequest) {
      mapController.map.setZoom(zoomRequest.value);
    }
  });

  $effect(() => {
    if (!mapController || styleRequest === 0) return;

    const map = mapController.map;
    const captureStyle = () => {
      const style = map.getStyle();
      if (style) onStyleSnapshot?.(style);
    };

    if (map.getStyle()) {
      captureStyle();
    } else {
      map.once("styledata", captureStyle);
      return () => {
        map.off("styledata", captureStyle);
      };
    }
  });

  onMount(() => {
    const token = import.meta.env.PUBLIC_ARCGIS_ACCESS_TOKEN?.trim();

    if (!token) {
      console.error("PUBLIC_ARCGIS_ACCESS_TOKEN is not set.");
      return;
    }

    const dataServiceToken =
      import.meta.env.PUBLIC_ARCGIS_DATA_SERVICE_TOKEN?.trim();

    if (!dataServiceToken) {
      console.error("PUBLIC_ARCGIS_DATA_SERVICE_TOKEN is not set.");
    }

    const controller = createMap(
      mapElement,
      token,
      dataServiceToken,
      onLegendChange,
    );
    mapController = controller;

    return () => {
      mapController = null;
      controller.map.remove();
    };
  });
</script>

<div class="viewer-canvas">
  <div
    bind:this={mapElement}
    class="map-container"
    role="application"
    aria-label="Map viewer"
  ></div>
</div>
