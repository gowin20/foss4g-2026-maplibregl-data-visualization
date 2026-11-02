<script lang="ts">
  import type { LegendEntry, LegendLayer } from "../map/legend";

  let { layers = [] }: { layers?: LegendLayer[] } = $props();
</script>

{#snippet entriesList(
  layer: LegendLayer,
  entries: LegendEntry[],
  label: string,
)}
  <ul class="legend-entries" aria-label={label}>
    {#each entries as entry (JSON.stringify([entry.label, entry.color]))}
      <li class="legend-entry">
        <svg
          class="legend-swatch"
          viewBox="0 0 28 18"
          aria-hidden="true"
          focusable="false"
        >
          {#if layer.symbol === "line"}
            <line
              x1="2"
              y1="9"
              x2="26"
              y2="9"
              stroke={entry.color}
              stroke-width={layer.lineWidth}
              stroke-opacity={layer.opacity}
            />
          {:else if layer.symbol === "circle"}
            <circle
              cx="14"
              cy="9"
              r="6"
              fill={entry.color}
              fill-opacity={layer.opacity}
            />
          {:else}
            <rect
              x="2"
              y="2"
              width="24"
              height="14"
              fill={entry.color}
              fill-opacity={layer.opacity}
              stroke="var(--calcite-color-border-2)"
            />
          {/if}
        </svg>
        <span class="legend-label">{entry.label}</span>
      </li>
    {/each}
  </ul>
{/snippet}

<section aria-label="Map legend">
  {#each layers as layer (layer.id)}
    <calcite-block heading={layer.label} collapsible expanded>
      {#if layer.groups}
        {#each layer.groups as group (group.label)}
          <div class="legend-group">
            <h3 class="legend-group-heading">{group.label}</h3>
            {@render entriesList(layer, group.entries, group.label)}
          </div>
        {/each}
      {:else}
        {@render entriesList(layer, layer.entries, layer.label)}
      {/if}
    </calcite-block>
  {:else}
    <p class="legend-empty">No map layers loaded.</p>
  {/each}
</section>

<style>
  .legend-group + .legend-group {
    margin-top: 1rem;
  }

  .legend-group-heading {
    margin: 0 0 0.375rem;
    color: var(--calcite-color-text-2);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .legend-entries {
    display: grid;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .legend-entry {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: center;
    gap: 0.625rem;
    min-height: 1.75rem;
  }

  .legend-swatch {
    display: block;
    width: 28px;
    height: 18px;
  }

  .legend-label {
    min-width: 0;
    color: var(--calcite-color-text-1);
    font-size: 0.8125rem;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .legend-empty {
    margin: 1rem;
    color: var(--calcite-color-text-2);
    font-size: 0.875rem;
  }
</style>
