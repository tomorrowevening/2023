// Libs
import {
  BoxBufferGeometry,
  MathUtils,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera
} from 'three';
import gsap from 'gsap';
// Models
import dispatcher from '@ts/models/dispatcher';
import { Events, Scenes } from '@ts/models/types';
// Views
import BaseScene from '@ts/scenes/BaseScene';
// Utils
import debug from '@ts/utils/debug';

export default class IntroScene extends BaseScene {
  mesh!: Mesh;

  constructor() {
    super(Scenes.INTRO);
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 0, 300);
  }

  override init(): void {
    super.init();
  }

  override initScene(): void {
    const geom = new BoxBufferGeometry(100, 100, 100);
    const mat = new MeshNormalMaterial({
      transparent: true
    });
    this.mesh = new Mesh(geom, mat);
    this.scene.add(this.mesh);
  }

  protected override initDebug() {
      const folder = debug.folder('Intro', false, debug.parent);
  }

  override show(): void {
    super.show();
    this.mesh.material['opacity'] = 0;
    gsap.to(this.mesh.material, {
      opacity: 1,
      duration: 1
    });
  }

  override hide(): void {
    gsap.to(this.mesh.material, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        dispatcher.dispatchEvent({ type: Events.SCENE_HIDDEN });
      }
    });
  }

  update(): void {
    const time = this.clock.getElapsedTime();
    this.mesh.rotation.y = MathUtils.degToRad(time * 30);
    this.mesh.rotation.z = MathUtils.degToRad(time * 20);
  }

  resize(width: number, height: number) {
    this.camera['aspect'] = width / height;
	  this.camera.updateProjectionMatrix();
  }
}
