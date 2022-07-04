import {
  Mesh,
  Object3D,
  PlaneBufferGeometry,
  Texture,
  Vector2
} from 'three';
import gsap from 'gsap';
import { between, normalize, map, mix } from 'tomorrow_web/utils/math';
import { anchorGeometryTL } from 'tomorrow_web/utils/three';
import { assets } from '@ts/models/load';
import settings from '@ts/models/settings';
import BasicMaterial from '@ts/materials/BasicMaterial';

const unitSize = new Vector2(8, 16);

class LoadBubble extends Mesh {
  private mat: BasicMaterial;
  constructor(texture: Texture) {
    const geom = new PlaneBufferGeometry(unitSize.x, unitSize.y);
    anchorGeometryTL(geom);
    const mat = new BasicMaterial({
      map: texture,
      opacity: 0
    });
    super(geom, mat);
    this.mat = mat;
    this.opacity = 0;
  }

  get opacity(): number {
    return this.mat.alpha;
  }

  set opacity(value: number) {
    this.mat.alpha = value;
  }
}

export default class LoadBar extends Object3D {
  width: number = 0;
  height: number = 0;
  private _opacity: number = 0;
  private _progress: number = 0;

  constructor() {
    super();
    this.height = unitSize.y;

    const texture = assets.textures['loadBar'];
    texture.anisotropy = settings.anisotropy;
    texture.needsUpdate = true;
    for (let i = 0; i < 10; ++i) {
      const unit = new LoadBubble(texture);
      unit.position.x = i * unitSize.x;
      this.width = unit.position.x + unitSize.x;
      this.add(unit);
    }
  }

  public show() {
    this.opacity = 0;
    gsap.to(this, {
      opacity: 0.1,
      duration: 0.5
    });
  }

  public get opacity(): number {
    return this._opacity;
  }

  public set opacity(value: number) {
    this._opacity = value;
    let i = 0;
    this.children.forEach((child: Object3D) => {
      const wait = map(0, 9, 0, 0.5, i);
      i++;
      const unit = child as LoadBubble;
      gsap.to(unit, {
        opacity: value,
        delay: wait,
        overwrite: true
      });
    });
  }

  public get progress(): number {
    return this._progress;
  }

  public set progress(value: number) {
    this._progress = value;
    for (let i = 0; i < 10; ++i) {
      const start = i * 10;
      const end = start + 10;
      let value = 0;
      if (between(start, end, this._progress)) {
        value = normalize(start, end, this._progress);
      } else if (this._progress > end) {
        value = 1;
      }
      const unit = this.children[i] as LoadBubble;
      const unitOpacity = mix(0.1, 1, value);
      unit.opacity = unitOpacity;
    }
  }
}
