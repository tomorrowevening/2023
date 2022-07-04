import {
  Camera,
  CubeTexture,
  CubeTextureLoader,
  MathUtils,
  Object3D,
  Raycaster,
  Scene,
  SkeletonHelper,
  sRGBEncoding,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// Controls
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
//
import gl from '@ts/models/three';
import debug from './debug';
import { FolderApi } from 'tweakpane';
import { dispose } from 'tomorrow_web/utils/three';

// Loading Utils

export function loadFBX(path: string) {
  return new Promise<Object3D>((resolve, reject) => {
    const modelLoader = new FBXLoader();
    modelLoader.load(
      path,
      (loaded: Object3D) => { resolve(loaded); },
      (event: ProgressEvent) => { },
      () => { reject(); }
    );
  });
}

export function loadOBJ(path: string) {
  return new Promise<Object3D>((resolve, reject) => {
    const modelLoader = new OBJLoader();
    modelLoader.load(
      path,
      (loaded: Object3D) => { resolve(loaded); },
      (event: ProgressEvent) => { },
      () => { reject(); }
    );
  });
}

export function loadTexture(path: string) {
  return new Promise<Texture>((resolve, reject) => {
    const texLoader = new TextureLoader();
    texLoader.load(
      path,
      (texture: Texture) => {
        texture.needsUpdate = true;
        resolve(texture);
      },
      (event: ProgressEvent) => { },
      () => { reject(); }
    );
  });
}

// path[0] = folder path
// path[1] = file type (jpg, png, etc)
export function loadCubeTexture(path: Array<string>) {
  return new Promise<CubeTexture>((resolve, reject) => {
    const texLoader = new CubeTextureLoader();
    texLoader.setPath(path[0]);
    const type = path[1];
    const paths: Array<string> = [
      `px.${type}`,
      `nx.${type}`,
      `py.${type}`,
      `ny.${type}`,
      `pz.${type}`,
      `nz.${type}`
    ];
    texLoader.load(
      paths,
      (texture: CubeTexture) => {
        texture.encoding = sRGBEncoding;
        texture.needsUpdate = true;
        resolve(texture);
      },
      (event: ProgressEvent) => { },
      () => { reject(); }
    );
  });
}

export class DebugClick {
  scene: Scene;
  camera: Camera;

  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private currentObject?: Object3D;
  private transformControls: TransformControls;
  private skeletonHelper?: SkeletonHelper;
  private debugFolder!: FolderApi;

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;
    this.transformControls = new TransformControls(this.camera, gl.renderer.domElement);
    this.transformControls.name = 'transformControls';
    this.transformControls.space = 'local';
    this.scene.add(this.transformControls);
    this.debugFolder = debug.folder('Click', false, debug.parent);
  }

  enable() {
    const element = gl.renderer.domElement;
    element.addEventListener('click', this.onClick, false);
    window.addEventListener('keydown', this.onKey, false);
  }

  disable() {
    const element = gl.renderer.domElement;
    element.removeEventListener('click', this.onClick)
    window.removeEventListener('keydown', this.onKey);
  }

  private removeCurrent() {
    if (this.skeletonHelper !== undefined) {
      dispose(this.skeletonHelper);
      this.skeletonHelper = undefined;
    }
    this.transformControls.detach();
    this.currentObject = undefined;

    // Remove folder
    // this.debugFolder.expanded = false;
    const total = this.debugFolder.children.length - 1;
    for (let i = total; i > -1; --i) {
      this.debugFolder.remove(this.debugFolder.children[i]);
    }
  }

  private setCurrentObject(obj: Object3D) {
    if (this.currentObject !== undefined) {
      this.removeCurrent();
    }
    this.currentObject = obj;
    this.transformControls.attach(this.currentObject);

    debug.addInput(this.debugFolder, obj, 'visible');
    debug.addMonitor(this.debugFolder, obj.position, 'x', { label: 'pos.x' });
    debug.addMonitor(this.debugFolder, obj.position, 'y', { label: 'pos.y' });
    debug.addMonitor(this.debugFolder, obj.position, 'z', { label: 'pos.z' });
    debug.addMonitor(this.debugFolder, obj.rotation, 'x', { label: 'rot.x' });
    debug.addMonitor(this.debugFolder, obj.rotation, 'y', { label: 'rot.y' });
    debug.addMonitor(this.debugFolder, obj.rotation, 'z', { label: 'rot.z' });

    let hasSkin = obj['isSkinnedMesh'];
    for (let i = 0; i < obj.children.length; i++) {
      const child = obj.children[i];
      if (child['isSkinnedMesh']) {
        hasSkin = true;
        break;
      }
    }
    if (hasSkin) {
      this.skeletonHelper = new SkeletonHelper(obj);
      this.scene.add(this.skeletonHelper);
    }
  }

  private getIntersectedObject(intersects): Object3D | undefined {
    const total = intersects.length;
    for (let i = 0; i < total; i++) {
      if (intersects[i].distance > 0) {
        const obj = intersects[i].object;
        if (obj.type !== 'Line') {
          if (obj.name !== 'X' && obj.name !== 'Y' && obj.name !== 'Z') {
            if (obj['isTransformControlsPlane'] === undefined) {
              return obj;
            }
          }
        }
      }
    }
    return undefined
  }

  private checkCollision() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    const totalIntersections = intersects.length
    const obj = this.getIntersectedObject(intersects);
    if (obj !== undefined) {
      if (obj !== this.currentObject) {
        const toAdd = obj['isSkinnedMesh'] !== undefined ? obj.parent! : obj;
        this.setCurrentObject(toAdd);
      }
    } else {
      if (totalIntersections < 4) this.removeCurrent();
    }
  }

  // Events

  private onClick = (event: MouseEvent) => {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this.checkCollision();
  }

  private onKey = (event: KeyboardEvent) => {
    if (this.currentObject === undefined) return;
    switch (event.keyCode) {
      case 81: // Q
        this.transformControls.setSpace(this.transformControls.space === 'local' ? 'world' : 'local');
        break;

      case 87: // W
        this.transformControls.setMode('translate');
        break;

      case 69: // E
        this.transformControls.setMode('rotate');
        break;

      case 82: // R
        this.transformControls.setMode('scale');
        break;

      case 187:
      case 107: // +, =, num+
        this.transformControls.setSize(this.transformControls.size + 0.1);
        break;

      case 189:
      case 109: // -, _, num-
        this.transformControls.setSize(Math.max(this.transformControls.size - 0.1, 0.1));
        break;

      case 88: // X
        this.transformControls.showX = !this.transformControls.showX;
        break;

      case 89: // Y
        this.transformControls.showY = !this.transformControls.showY;
        break;

      case 90: // Z
        this.transformControls.showZ = !this.transformControls.showZ;
        break;

      case 32: // Spacebar
        this.transformControls.enabled = !this.transformControls.enabled;
        break;
    }
  }
}