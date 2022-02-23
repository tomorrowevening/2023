// Libs
import { Mesh } from 'three';
import { orthoCamera, triangle } from 'tomorrow_web/utils/three';
import { delay } from 'tomorrow_web/utils/dom';
// Models
import dispatcher from '@ts/models/dispatcher';
import gl from '@ts/models/three';
import { Events, Scenes } from '@ts/models/types';
// Views
import BaseScene from '@ts/scenes/BaseScene';
import WelcomeMaterial from './WelcomeMaterial';

export default class WelcomeScene extends BaseScene {
  bgMaterial!: WelcomeMaterial;

  private sectionElement: HTMLElement;
  private button: HTMLButtonElement;

  constructor() {
    super(Scenes.WELCOME);
    this.camera = orthoCamera.clone();
    this.sectionElement = document.getElementById('welcome')!;
    this.button = this.sectionElement.querySelector('button')!;
  }

  override init(): void {
    super.init();
    const onClick = () => {
      this.button.removeEventListener('click', onClick);
      dispatcher.dispatchEvent({
        type: Events.SHOW_SCENE,
        scene: Scenes.INTRO
      });
    };
    this.button.addEventListener('click', onClick, false);
  }

  override initScene(): void {
    this.bgMaterial = new WelcomeMaterial();
    const mesh = new Mesh(triangle, this.bgMaterial);
    this.scene.add(mesh);
  }

  override draw(): void {
    this.bgMaterial.update(this.clock.getDelta());
    const renderTarget = gl.renderTargets.get('main');
    if (renderTarget) gl.renderer.setRenderTarget(renderTarget);
    gl.renderer.clear();
    gl.renderer.render(this.scene, this.camera);
  }

  override show(): void {
    super.show();
    this.bgMaterial.show();
    delay(0.5).then(() => {
      this.sectionElement.classList.add('visible');
    });
  }

  override hide(): void {
    this.sectionElement.classList.remove('visible');
    this.bgMaterial.hide();
    delay(0.5).then(() => {
      this.sectionElement.classList.add('hidden');
      dispatcher.dispatchEvent({ type: Events.SCENE_HIDDEN });
    });
  }
}
