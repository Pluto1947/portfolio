// Stand in for three/webgpu: used by the heatmap layer, which this site never uses.
const unused = () => { throw new Error('three/webgpu is stubbed out; see src/lib/globe-stubs/README.md'); };
export class WebGPURenderer { constructor() { unused(); } }
export class StorageInstancedBufferAttribute { constructor() { unused(); } }
