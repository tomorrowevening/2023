// Libs
import {
  BoxBufferGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  SphereBufferGeometry
} from 'three';
import gsap from 'gsap';
// Models
import dispatcher from '@ts/models/dispatcher';
import { Events, Scenes } from '@ts/models/types';
// Views
import BaseScene from '@ts/scenes/BaseScene';
// Utils
import debug from '@ts/utils/debug';
import { DebugClick } from '@ts/utils/three';

export default class IntroScene extends BaseScene {
  mesh!: Mesh;

  private click!: DebugClick

  constructor() {
    super(Scenes.INTRO);
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 0, 500);
  }

  override init(): void {
    super.init();
  }

  override initScene(): void {
    const light = new DirectionalLight();
    light.name = 'directionalLight';
    light.position.set(200, 1000, 500);
    this.scene.add(light);

    this.mesh = new Mesh(
      new BoxBufferGeometry(100, 100, 100),
      new MeshNormalMaterial()
    );
    this.mesh.name = 'spin'
    this.scene.add(this.mesh);

    const test = new Mesh(
      new SphereBufferGeometry(50),
      new MeshNormalMaterial()
    )
    test.name = 'test'
    test.position.set(-200, 0, 0);
    this.scene.add(test);
  }

  protected override initDebug() {
    const folder = debug.folder('Intro', false, debug.parent);
    this.click = new DebugClick(this.scene, this.camera);
    this.click.enable();
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

    if (debug.enabled) this.click.disable()
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
