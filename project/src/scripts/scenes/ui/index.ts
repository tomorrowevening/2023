// Libs
import {
  Mesh,
  Object3D,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2
} from 'three';
// Models
import { assets } from '@ts/models/load';
import gl from '@ts/models/three';
// Views
import UITexture from '@ts/views/ui/UITexture';
// Utils
import { updateCameraOrtho } from 'tomorrow_web/utils/three';

const raycaster = new Raycaster();
const pointer = new Vector2();

export default class UIScene extends Scene {
  camera: OrthographicCamera;

  private currentIntersection?: Object3D;

  constructor() {
    super();
    this.camera = new OrthographicCamera(0, 1, 0, 1, 0.1, 101);
    this.camera.position.z = 100;
  }

  init() {
    const size = 50;
    const logo = new UITexture(size, size, assets.textures['te_logo'], () => {
      window.location.href = 'http://tomorrowevening.com/';
    });
    logo.position.set(50, -50, 0);
    this.add(logo);
  }

  enable() {
    const canvas = gl.renderer.domElement;
    canvas.addEventListener('pointermove', this.mouseMove, false);
    canvas.addEventListener('click', this.mouseClick, false);
  }

  disable() {
    const canvas = gl.renderer.domElement;
    canvas.removeEventListener('pointermove', this.mouseMove);
    canvas.removeEventListener('click', this.mouseClick);
  }

  draw() {
    if (this.children.length > 0) {
      const renderTarget = gl.renderTargets.get('ui');
      if (renderTarget) gl.renderer.setRenderTarget(renderTarget);
      gl.renderer.setClearAlpha(0);
      gl.renderer.clear();
      gl.renderer.render(this, this.camera);
    }
  }

  resize(width: number, height: number) {
    updateCameraOrtho(this.camera, width, height);
  }

  // Incase we want to check for interactions

  private updatePointer(event: any) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  private checkIntersections(onIntersection: (obj: any) => void) {
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(this.children);
    onIntersection(intersects[0]);
  }

  private rollOver() {
    if (this.currentIntersection !== undefined && this.currentIntersection['isOver'] === false) {
      this.currentIntersection['isOver'] = true;
      this.currentIntersection['rollOver']();
    }
  }

  private rollOut() {
    if (this.currentIntersection !== undefined && this.currentIntersection['isOver'] === true) {
      this.currentIntersection['isOver'] = false;
      this.currentIntersection['rollOut']();
    }
  }

  private mouseMove = (event: any) => {
    this.updatePointer(event);

    this.checkIntersections((obj: any) => {
      if (obj !== undefined) {
        const isNew = this.currentIntersection !== obj.object;
        if (isNew) this.rollOut();
        this.currentIntersection = obj.object;
        if (isNew) this.rollOver();
      } else {
        this.rollOut();
        this.currentIntersection = undefined;
      }
    });
  }

  private mouseClick = (event: any) => {
    this.updatePointer(event);
    this.checkIntersections((obj: any) => {
      if (obj !== undefined) {
        const mesh = obj.object as Mesh;
        if (mesh['isOver'] !== undefined) {
          mesh['click']();
        }
      }
    });
  }
}