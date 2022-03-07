import {
  Mesh,
  PlaneBufferGeometry,
  Texture
} from 'three';
import gsap from 'gsap';
import { anchorGeometryTL } from 'tomorrow_web/utils/three';
import BasicMaterial from '@ts/materials/BasicMaterial';
import BaseUI from './BaseUI';

export default class UITexture extends Mesh implements BaseUI {
  isOver: boolean;

  material: BasicMaterial;

  click: () => void;

  constructor(
    width: number,
    height: number,
    texture: Texture | null,
    callback?: () => void
  ) {
    const geom = new PlaneBufferGeometry(width, height);
    const mat = new BasicMaterial({
      map: texture,
      transparent: true
    });
    anchorGeometryTL(geom);
    super(geom, mat);
    this.material = mat;
    this.isOver = false;
    this.click = callback !== undefined ? callback : () => { };
  }

  // @ts-ignore
  override onBeforeRender() {
    this.material.alpha = this.material.opacity;
  }

  rollOver() {
    gsap.to(this.material, {
      opacity: 0.75,
      duration: 0.25
    });
  }

  rollOut() {
    gsap.to(this.material, {
      opacity: 1,
      duration: 0.25
    });
  }

  get opacity(): number {
    return this.material.alpha;
  }

  set opacity(value: number) {
    this.material.alpha = value;
  }
}