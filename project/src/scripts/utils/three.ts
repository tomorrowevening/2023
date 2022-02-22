import {
  CubeTexture,
  CubeTextureLoader,
  Object3D,
  sRGBEncoding,
  Texture,
  TextureLoader
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Loading Utils

export function loadOBJ(path: string) {
  return new Promise<Object3D>((resolve, reject) => {
    const modelLoader = new OBJLoader();
    modelLoader.load(
      path,
      (gltf: Object3D) => { resolve(gltf); },
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