<script lang="ts">
  import MapLegend from "./MapLegend.svelte";
  import type { LegendLayer } from "../map/legend";

  let { layers = [] }: { layers?: LegendLayer[] } = $props();
</script>

<calcite-panel heading="Legend">
  <MapLegend {layers} />
</calcite-panel>
