<calcite-navigation class="app-header">
  <calcite-navigation-logo slot="logo" heading="Project title"></calcite-navigation-logo>
  <a
    class="repo-link"
    slot="content-end"
    href="https://github.com/"
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
    --calcite-navigation-logo-heading-text-color: var(--calcite-color-text-1);
    border-block-end: 1px solid var(--calcite-color-border-2);
  }

  .repo-link {
    display: inline-flex;
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