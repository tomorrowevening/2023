// Libs
import { Mesh } from 'three';
import { orthoCamera, triangle } from 'tomorrow_web/utils/three';
// Models
import gl from '@ts/models/three';
import { Scenes } from '@ts/models/types';
// Views
import BaseScene from '@ts/scenes/BaseScene';
import WelcomeMaterial from './WelcomeMaterial';

export default class WelcomeScene extends BaseScene {
  constructor() {
    super(Scenes.WELCOME);
  }

  override initScene(): void {
    const mesh = new Mesh(triangle, new WelcomeMaterial());
    this.scene.add(mesh);
  }

  override draw(): void {
    // gl.renderer.render(this.scene, orthoCamera);
    const renderTarget = gl.renderTargets.get('main');
    if (renderTarget) gl.renderer.setRenderTarget(renderTarget);
    gl.renderer.setClearAlpha(0);
    gl.renderer.clear();
    gl.renderer.render(this.scene, orthoCamera);
  }
}
