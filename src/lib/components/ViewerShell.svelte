<script lang="ts">
  import AppHeader from './AppHeader.svelte'
  import LeftPanel from './LeftPanel.svelte'
  import RightPanel from './RightPanel.svelte'
  import ViewerCanvas from './ViewerCanvas.svelte'

  let leftCollapsed = $state(true)
  let rightCollapsed = $state(true)
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
        icon={leftCollapsed ? 'chevrons-right' : 'chevrons-left'}
        text={leftCollapsed ? 'Expand controls' : 'Collapse controls'}
        onclick={() => (leftCollapsed = !leftCollapsed)}
      ></calcite-action>
    </calcite-action-bar>
    <LeftPanel />
  </calcite-shell-panel>

  <ViewerCanvas />

  <calcite-shell-panel slot="panel-end" width="m" collapsed={rightCollapsed}>
    <calcite-action-bar slot="action-bar" expand-toggle-disabled>
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <calcite-action
        role="button"
        tabindex="0"
        icon={rightCollapsed ? 'chevrons-left' : 'chevrons-right'}
        text={rightCollapsed ? 'Expand project information' : 'Collapse project information'}
        onclick={() => (rightCollapsed = !rightCollapsed)}
      ></calcite-action>
    </calcite-action-bar>
    <RightPanel />
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