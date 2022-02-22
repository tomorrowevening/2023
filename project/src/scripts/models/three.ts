import {
  LinearFilter,
  NearestFilter,
  VSMShadowMap,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import settings, { Quality } from '@ts/models/settings';
import debug from '@ts/utils/debug';

class WebGLInstance {
  renderer!: WebGLRenderer;

  renderTargets: Map<string, WebGLRenderTarget> = new Map<string, WebGLRenderTarget>();

  constructor() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderTargets.set('main', new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: NearestFilter
    }));

    this.renderTargets.set('ui', new WebGLRenderTarget(width, height, {
      depthBuffer: false,
      minFilter: LinearFilter,
      magFilter: NearestFilter
    }));
  }

  init() {
    const canvas = document.getElementById('world') as HTMLCanvasElement;
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      stencil: false,
      depth: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = VSMShadowMap;

    const anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 8);
    settings.anisotropy = anisotropy;

    if (debug.enabled) debug.initSystem();
  }

  dispose() {
    this.renderer.dispose();
  }

  resize(width: number, height: number) {
    this.renderTargets.forEach((renderTarget: WebGLRenderTarget) => {
      renderTarget.setSize(width, height);
    });
    this.renderer.setSize(width, height);
  }

  get dpr(): number {
    return settings.quality === Quality.LOW ? 1 : window.devicePixelRatio;
  }
}

export default new WebGLInstance();