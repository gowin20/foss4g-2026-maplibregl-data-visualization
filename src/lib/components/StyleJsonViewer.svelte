<script lang="ts">
  import hljs from "highlight.js/lib/core";
  import json from "highlight.js/lib/languages/json";
  import type { StyleSpecification } from "maplibre-gl";
  import { formatStyleJson } from "../map/style-json";

  hljs.registerLanguage("json", json);

  let {
    style,
    onclose,
  }: {
    style: StyleSpecification;
    onclose: () => void;
  } = $props();

  const formatted = $derived(formatStyleJson(style));
  const highlighted = $derived(
    hljs.highlight(formatted, { language: "json" }).value,
  );
</script>

<calcite-dialog
  heading="Map style JSON"
  width="m"
  overlay-positioning="fixed"
  modal
  open
  oncalciteDialogClose={onclose}
>
  <div
    class="style-code"
    role="textbox"
    aria-label="Map style JSON source"
    aria-readonly="true"
    aria-multiline="true"
    tabindex="0"
  >
    <pre><code class="hljs language-json">{@html highlighted}</code></pre>
  </div>
</calcite-dialog>

<style>
  calcite-dialog {
    --calcite-dialog-max-size-x: min(64rem, calc(100vw - 2rem));
    --calcite-dialog-max-size-y: calc(100dvh - 2rem);
    --calcite-dialog-content-space: 0;
  }

  .style-code {
    max-height: min(70dvh, 45rem);
    margin: 0;
    padding: 1rem;
    overflow: auto;
    color: var(--calcite-color-text-1);
    background: var(--calcite-color-foreground-1);
    font-family: var(--calcite-font-family-code, monospace);
    font-size: 0.8125rem;
    line-height: 1.55;
    tab-size: 2;
    white-space: pre;
    user-select: text;
  }

  .style-code:focus-visible {
    outline: 2px solid var(--calcite-color-brand);
    outline-offset: -2px;
  }

  .style-code pre {
    margin: 0;
  }

  .style-code pre,
  .style-code code {
    font: inherit;
  }

  .style-code :global(.hljs-attr) {
    color: light-dark(#135caa, #8ebdff);
  }

  .style-code :global(.hljs-string) {
    color: light-dark(#24733e, #92d7a3);
  }

  .style-code :global(.hljs-number) {
    color: light-dark(#984f10, #eac086);
  }

  .style-code :global(.hljs-literal) {
    color: light-dark(#873d8c, #d9aaef);
  }

  .style-code :global(.hljs-punctuation) {
    color: var(--calcite-color-text-2);
  }
</style>
