// Libs
import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
  Raycaster,
  Scene,
  Vector2
} from 'three';
import { anchorGeometryTL } from 'tomorrow_web/utils/three';
// Models
import { assets } from '@ts/models/load';
import gl from '@ts/models/three';
// Views
import BaseUI from '@ts/views/ui/BaseUI';
import UITexture from '@ts/views/ui/UITexture';

const raycaster = new Raycaster();
const pointer = new Vector2();

export default class UIScene extends Scene {
  camera: OrthographicCamera;

  constructor() {
    super();
    this.camera = new OrthographicCamera(0, 1, 0, 1, 0.1, 101);
    this.camera.position.z = 100;
  }

  init() {
    const size = 50;
    const logo = new UITexture(size, size, assets.textures['te_logo']);
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
    this.camera.left = width / -2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = height / -2;
    this.camera.position.x = width / 2;
    this.camera.position.y = height / -2;
    this.camera.updateProjectionMatrix();
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
    for (let i = 0; i < intersects.length; i++) {
      onIntersection(intersects[i]);
    }
  }

  private mouseMove = (event: any) => {
    this.updatePointer(event);

    // for (let i = 0; i < this.children.length; i++) {
    //   const child = this.children[i];
    //   if (child['isOver'] === true) {
    //     child['isOver'] = false;
    //     console.log('out', this.hoverItems.search(child.uuid));
    //     // child['rollOut']();
    //     // console.log('out', child);
    //   }
    // }

    this.checkIntersections((obj: any) => {
      const mesh = obj.object as Mesh;
      if (mesh['isOver'] === false) {
        // currentItems += mesh.uuid;
        console.log('over', obj);
        mesh['isOver'] = true;
        mesh['rollOver']();
      }
    });
  }

  private mouseClick = (event: any) => {
    this.updatePointer(event);
    this.checkIntersections((obj: any) => {
      const mesh = obj.object as Mesh;
      if (mesh['isOver'] !== undefined) {
        console.log('click', mesh);
        mesh['click']();
      }
    });
  }
}