import {
  VSMShadowMap,
  WebGLRenderer
} from 'three';
import settings, { Quality } from '@ts/models/settings';
import debug from '@ts/utils/debug';

class WebGLInstance {
  renderer!: WebGLRenderer;

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
    this.renderer.setSize(width, height);
  }

  get dpr(): number {
    return settings.quality === Quality.LOW ? 1 : window.devicePixelRatio;
  }
}

export default new WebGLInstance();