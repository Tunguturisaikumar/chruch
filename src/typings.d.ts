declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    constructor(object?: any, domElement?: HTMLElement);
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    update(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  export class EffectComposer {
    constructor(renderer?: any);
    addPass(pass: any): void;
    render(): void;
  }
}
