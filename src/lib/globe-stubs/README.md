# globe.gl stubs

globe.gl (through three-globe) imports modules for layers this site never uses:
graticules, hexagons, heatmaps (WebGPU), 3D text labels and polygons. (Map tiles are used for the NASA zoom detail, so they are not stubbed.)
`astro.config.mjs` points those imports at these small stand-ins, which cuts the
globe bundle by more than half.

If you start using one of those layers (for example `hexBinPointsData`,
`heatmapsData`, `labelsData`, `polygonsData` or `showGraticules`), remove the matching alias in `astro.config.mjs`.
