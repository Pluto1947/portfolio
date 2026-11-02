// Stand in for h3-js: used by the hexagon layers, which this site never uses.
const unused = () => { throw new Error('h3-js is stubbed out; see src/lib/globe-stubs/README.md'); };
export const latLngToCell = unused;
export const cellToLatLng = unused;
export const cellToBoundary = unused;
export const polygonToCells = unused;
