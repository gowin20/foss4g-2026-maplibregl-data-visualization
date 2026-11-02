<script lang="ts">
  import { onMount } from 'svelte'
  import { createMap } from '../map/map'

  let mapElement: HTMLDivElement

  onMount(() => {
    const token = import.meta.env.PUBLIC_ARCGIS_ACCESS_TOKEN?.trim()

    if (!token) {
      console.error('PUBLIC_ARCGIS_ACCESS_TOKEN is not set.')
      return
    }

    const map = createMap(mapElement, token)

    return () => map.remove()
  })
</script>

<div class="viewer-canvas">
  <div bind:this={mapElement} class="map-container" role="application" aria-label="Map viewer"></div>
</div>