// Stand in for three-slippy-map-globe: the tile engine is created at start up
// but only shown when globeTileEngineUrl is set, which this site never does.
import { Group } from 'three';
export default class SlippyMap extends Group {
  constructor() { super(); this.visible = false; this.tileUrl = ''; this.maxLevel = 0; this.curvatureResolution = 5; }
  updatePov() {}
  clearTiles() {}
}
