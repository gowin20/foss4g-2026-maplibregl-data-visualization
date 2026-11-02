# FOSS4G 2026: MapLibre GL JS Visualizer

An interactive mapping demo for FOSS4G 2026 that explores land use, housing, and household demographics in Sacramento, California. The visualizer uses MapLibre GL JS and MapLibre ArcGIS to compare vector-tile delivery with feature layers rendered as GeoJSON, including data-driven styling, grouped legends, and dataset-specific feature popups.

The interface is built with Svelte, TypeScript, Vite, and Calcite Design System. Controls support switching datasets, changing FeatureLayer loading modes, inspecting tile boundaries, and setting an exact integer zoom level.

**Live application:** https://gowen.dev/foss4g-2026-maplibregl-data-visualization/

**Presentations:** 
* [foss4g-maplibre-data-visualization.pptx](foss4g-maplibre-data-visualization.pptx)
* [foss4g-optimized-maplibre-queries.pptx](foss4g-optimized-maplibre-queries.pptx)

## Study Area

The primary study area is the **city of Sacramento**, with the city boundary providing a common reference for the thematic datasets. The examples focus on:

- **Land use:** parcel-level classifications, including residential, commercial, industrial, and public uses.
- **Households and housing:** household income, vacant housing units, renter share, household density, and Tapestry segmentation.
- **Census geography:** census blocks and census tracts, illustrating different geographic scales and data-delivery strategies.

County library locations provide additional local context. The city outline is a visual reference, not a clipping mask; countywide features and census boundaries may extend beyond it.

## Using the Visualizer

- The app starts with `<no current selection>`, showing the ArcGIS Human Geography basemap and Sacramento city boundary. Both control panels start expanded.
- Select a dataset in the left panel to replace the current thematic layers. The city boundary remains visible, and the right-hand legend updates with the selected dataset.
- Click features with configured popups to inspect their relevant attributes. Currency, counts, percentages, and Tapestry segment names are formatted for readability.
- Use **Feature layer loading mode (GeoJSON)** to choose **Default**, **Snapshot**, or **On-demand**. Changing the mode reloads dynamic FeatureLayers without reloading vector-tile layers or the fixed city boundary.
- Enable **Show tile boundaries** to display MapLibre's tile-boundary debugging overlay.
- Enter a whole number under **Set zoom** and select **Confirm** to call `map.setZoom` with that value.

## Catalog of Layers

The following datasets are available in the selector. The vector-tile and feature-layer versions of related geography let you compare delivery and loading behavior by switching datasets.

| Dataset | Delivery | Visualization and attributes |
| --- | --- | --- |
| Sacramento Parcels by Land Use | Vector tiles | Parcels colored by `LU_SPECIF`, with legend groups based on `LU_GENERAL`. |
| Esri Tapestry Segments (Census Blocks) | Vector tiles | Segment colors based on `TapestryHouseholds_THHSCODE`, with segment code/name labels and Lifemode legend groups. |
| Median Household Income USD (Census Blocks) | Vector tiles | Five income classes based on `householdincome_MEDHINC_CY`; zero-income blocks are excluded. |
| Vacant Housing Units (2026) | Feature layer / GeoJSON | Red-orange circles scaled by `vacant_VACANT_CY`; zero-count points are excluded. A census-block backdrop loads with this view. |
| # of Renters vs # of Owners | Vector tiles | Nine classes combining renter share and household density. Popups show `pct_RENTER` and `HH_DEN_KM`; zero-household blocks are excluded. |
| Sacramento County Libraries | Feature layer / GeoJSON | Representative point markers derived from library footprints, with `LANDMARK` popups. |
| Parcels (Feature layer) | Feature layer / GeoJSON | Blue parcel polygons for comparing feature-service loading modes with vector tiles. |
| Census blocks (feature layer) | Feature layer / GeoJSON | Blue census-block polygons for feature-service loading demonstrations. |
| Census tracts (feature layer) | Feature layer / GeoJSON | Blue census-tract polygons for viewing a broader geographic aggregation. |

Two additional layers support these views:

- **Sacramento City Boundary:** an always-visible feature layer with a black outline; it is not managed by the dataset selector.
- **Census Blocks:** light-gray vector-tile polygons with gray outlines, added and removed with the vacant-housing view rather than offered as an independent selection.

Service URLs, ArcGIS item IDs, styling, legend metadata, and popup definitions are recorded in [src/lib/map/layers/](src/lib/map/layers/).

## Local Development

Use **Node.js 22.12+** and npm. An internet connection and ArcGIS API keys with access to the configured services are required.

### Install Dependencies

From the project root:

```sh
npm install
```

### Configure ArcGIS Access

Create a local [.env](.env) file in the project root:

```dotenv
PUBLIC_ARCGIS_ACCESS_TOKEN=your-basemap-api-key
PUBLIC_ARCGIS_DATA_SERVICE_TOKEN=your-data-service-api-key
```

- `PUBLIC_ARCGIS_ACCESS_TOKEN` authenticates the basemap.
- `PUBLIC_ARCGIS_DATA_SERVICE_TOKEN` authenticates the configured feature and vector-tile services. Ensure the credential has the necessary privileges and item access.

These are browser-distributed API keys: `PUBLIC_` values are exposed in the client bundle. Use appropriately restricted, least-privilege keys, and do not commit credentials or put confidential application secrets in these variables. Restart Vite after changing environment variables.

### Run the App

```sh
npm run dev
```

Open the local URL printed by Vite, normally <http://localhost:5173>.

### Check and Build

```sh
npm run check
npm run build
npm run preview
```

`check` runs Svelte and TypeScript diagnostics. `build` creates the production bundle, and `preview` serves that bundle locally. Hot reload may reset the selected dataset or other control state during development.

## GitHub Pages Deployment

The [deployment workflow](.github/workflows/deploy-pages.yml) follows the [AEC viewer deployment](https://github.com/gowin20/autodesk-and-arcgis-aec-viewer/blob/main/.github/workflows/deploy-pages.yml): pushes to `main` or manual runs build the app and publish the static output to the `gh-pages` branch.

1. In **Settings > Secrets and variables > Actions > Variables**, add repository variables named `PUBLIC_ARCGIS_ACCESS_TOKEN` and `PUBLIC_ARCGIS_DATA_SERVICE_TOKEN` with the same browser-safe API keys used locally. Deployment fails if either variable is missing.
2. Push the source, including the workflow, to `main`. The first successful workflow run creates or updates `gh-pages` with the contents of `dist`.
3. In **Settings > Pages > Build and deployment**, choose **Deploy from a branch**, select **gh-pages** and **/ (root)**, then save. Do not select **GitHub Actions** as the Pages source; this workflow publishes to a branch.
4. For later deployments, push to `main` or select **Actions > Deploy GitHub Pages > Run workflow** on `main`.

The deployed app is available at <https://gowin20.github.io/foss4g-2026-data-visualization-with-maplibre/>. The workflow sets Vite's base path from the repository name so scripts, styles, the favicon, and Calcite assets load under that URL; local development keeps its default root path.

Both API keys are embedded in the public bundle, not kept secret by GitHub Pages. Restrict their privileges and allowed referrers to the deployed site (and any local development URLs you need). Repository policy must allow the workflow's `contents: write` permission to publish to `gh-pages`.

## Layer Configuration

- [src/lib/map/datasets.ts](src/lib/map/datasets.ts) registers the selectable datasets and their optional contextual layers.
- [src/lib/map/layers/](src/lib/map/layers/) contains each layer's service URL, item ID, style expressions, legend configuration, and optional `popup.fields` definitions.
- [src/lib/map/map.ts](src/lib/map/map.ts) manages the basemap, dataset switching, source cleanup, legends, and feature click handling.
- [src/lib/map/feature-layer.ts](src/lib/map/feature-layer.ts) manages FeatureLayer lifecycle cleanup and point conversion for incoming library data.

To add a dataset, create a layer configuration and register it in the dataset catalog. Give each view a unique `id`, even when multiple visualizations share the same ArcGIS item and service URL. The existing controls use these configurations to manage visibility, legends, and popups.

The presentation's classification references are included here:

- [reference/sacramentoParcels_frequency.csv](reference/sacramentoParcels_frequency.csv): parcel land-use categories and colors.
- [reference/arcgisTapestryColors.csv](reference/arcgisTapestryColors.csv): Tapestry segment codes, names, Lifemode groups, and colors.

## Data Sources and Attribution

The demo references live ArcGIS-hosted services. Source portals and data products include:

- [Sacramento County Open Data Hub](https://data-sacramentocounty.opendata.arcgis.com/): local government geospatial data and source metadata.
- [ArcGIS Living Atlas](https://livingatlas.arcgis.com/en/home/): curated geographic and demographic layers.
- [Esri Demographic Data](https://www.esri.com/en-us/arcgis/products/arcgis-data/explore/demographics-data): household, housing, income, and Tapestry segmentation data products.

The basemap is `arcgis/human-geography`, supplied through ArcGIS basemap services. Basemap and service credits are displayed in the map's attribution control; retain those credits when reusing the application or sharing map outputs.

Consult the ArcGIS items and service metadata linked from the layer configurations for ownership, licensing, geographic coverage, and reference years. The repository contains visualization configurations and reference tables, not copies of the complete hosted datasets.

### Service Citations

The following inventory records the service URLs and ArcGIS item IDs configured in this project. Each unique source is listed once; multiple visualizations can share the same source. Item links open the ArcGIS item details, where publisher information, usage terms, and source credits should be consulted.

1. **Sacramento City Boundary** [Feature layer]. The permanent city-outline reference.

	Service URL: <https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/SacramentoCityBoundary/FeatureServer/8>

	Item ID: [`cd92834cd20945c390b38bd1cb7824c8`](https://www.arcgis.com/home/item.html?id=cd92834cd20945c390b38bd1cb7824c8).

2. **Sacramento Parcels by Land Use** [Vector tile service]. Used for the parcel land-use visualization.

	Service URL: <https://vectortileservices3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/SacramentoCityParcels_VTL/VectorTileServer>

	Item ID: [`5de6825077ef4cdbbd2131fdd382587f`](https://www.arcgis.com/home/item.html?id=5de6825077ef4cdbbd2131fdd382587f).

3. **Sacramento Census Blocks Enrichment** [Vector tile service]. Shared by the Tapestry segments, median household income, renters-versus-owners, and contextual census-block background views.

	Service URL: <https://vectortileservices3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Sacramento_Census_Blocks_Enrichment_(VTL)/VectorTileServer>

	Item ID: [`b3352861665e4e839900fc5d7920d6c8`](https://www.arcgis.com/home/item.html?id=b3352861665e4e839900fc5d7920d6c8).

4. **Vacant Housing Units (2026)** [Feature layer]. Census-block points used for proportional vacancy circles.

	Service URL: <https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/SacramentoCensBlocks_Point/FeatureServer/26>

	Parent service URL: <https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/SacramentoCensBlocks_Point/FeatureServer>

	Item ID: [`43c527113ab74bd58c9df3aadb1e6892`](https://www.arcgis.com/home/item.html?id=43c527113ab74bd58c9df3aadb1e6892).

5. **Sacramento County Libraries** [Feature layer]. Library footprints rendered as representative point markers, retaining the `LANDMARK` attribute.

	Service URL: <https://services1.arcgis.com/5NARefyPVtAeuJPU/ArcGIS/rest/services/Libraries/FeatureServer/0>

	Item ID: [`408cfc9e87e5452ab71301054ae2807c`](https://www.arcgis.com/home/item.html?id=408cfc9e87e5452ab71301054ae2807c).

6. **Parcels (Feature layer)** [Feature layer]. Parcel polygons used to demonstrate GeoJSON loading modes.

	Service URL: <https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/SacramentoCityParcels_Feature/FeatureServer/4>

	Item ID: [`3caa0433c4b4401ab490e25f463a79e1`](https://www.arcgis.com/home/item.html?id=3caa0433c4b4401ab490e25f463a79e1).

7. **Census Blocks (Feature layer)** [Feature layer]. Enriched census-block polygons used to demonstrate GeoJSON loading modes.

	Service URL: <https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Enriched_SacramentoCensusBlocks_Feature/FeatureServer/22>

	Item ID: [`452d95e12d74482ba56e204aeca77025`](https://www.arcgis.com/home/item.html?id=452d95e12d74482ba56e204aeca77025).

8. **Census Tracts (Feature layer)** [Feature layer]. Census-tract polygons used to demonstrate GeoJSON loading modes.

	Service URL: <https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/SacramentoCensusTracts_Feature/FeatureServer/6>

	Item ID: [`de8487c436ba4beabc7bdd216b3beeb0`](https://www.arcgis.com/home/item.html?id=de8487c436ba4beabc7bdd216b3beeb0).

**Basemap citation:** Esri, **ArcGIS Human Geography** [Basemap style]. Style service URL: <https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/human-geography>. Style ID: `arcgis/human-geography`. No ArcGIS item ID is configured for the basemap; the app requests it by style ID. Retain the contributor credits returned by the basemap service and displayed on the map.

## Data and Demo Notes

- Layers can differ in vintage and geographic aggregation. Do not assume that every indicator represents the same census year or reporting unit.
- Large FeatureLayers may exceed snapshot geometry or service limits. **Default** can fall back to on-demand loading; **On-demand** loads features for the visible map extent as you pan and zoom.
- This is an exploratory presentation demo. Check the original data definitions and source metadata before using its classifications or indicators for analysis or planning decisions.
