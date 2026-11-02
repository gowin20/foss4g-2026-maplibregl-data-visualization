<calcite-navigation class="app-header">
  <h1 slot="logo" class="app-title">FOSS4G 2026: MapLibre GL JS visualizer</h1>
  <a
    class="repo-link"
    slot="content-end"
    href="https://github.com/gowin20/foss4g-2026-maplibregl-data-visualization"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="GitHub repository"
    title="GitHub repository"
  >
    <calcite-icon icon="launch" scale="s" aria-hidden="true"></calcite-icon>
    <span>GitHub</span>
  </a>
</calcite-navigation>

<style>
  .app-header {
    --calcite-navigation-background-color: var(--calcite-color-surface-1);
    border-block-end: 1px solid var(--calcite-color-border-2);
  }

  .app-title {
    display: flex;
    align-items: center;
    min-width: 0;
    margin: 0;
    padding: 0.375rem 1rem;
    color: var(--calcite-color-text-1);
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.3;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .repo-link {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    padding-inline: 1rem;
    color: var(--calcite-color-text-1);
    text-decoration: none;
  }

  .repo-link:hover {
    opacity: 0.75;
  }

  .repo-link:focus-visible {
    outline: 2px solid var(--calcite-color-brand);
    outline-offset: -2px;
  }
</style>
