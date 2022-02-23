import {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Texture
} from 'three';
import gsap from 'gsap';
import { anchorGeometryTL } from 'tomorrow_web/utils/three';
import BaseUI from './BaseUI';

export default class UITexture extends Mesh implements BaseUI {
  isOver: boolean;

  material: MeshBasicMaterial;

  constructor(width: number, height: number, texture: Texture | null) {
    const geom = new PlaneBufferGeometry(width, height);
    const mat = new MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    anchorGeometryTL(geom);
    super(geom, mat);
    this.material = mat;
    this.isOver = false;
  }

  rollOver() {
    gsap.to(this.material, {
      opacity: 0.8,
      duration: 0.5
    });
  }

  rollOut() {
    gsap.to(this.material, {
      opacity: 1,
      duration: 0.5
    });
  }

  click() {
    //
  }
}