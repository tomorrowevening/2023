// Libs
import {
  Mesh,
  Scene
} from 'three';
import { orthoCamera, triangle } from 'tomorrow_web/utils/three';
// Models
import gl from '@ts/models/three';
// Materials
import CompositeMaterial from '@ts/materials/post/CompositeMaterial';

export default class CompositeScene extends Scene {
  material: CompositeMaterial;

  constructor() {
    super();
    this.material = new CompositeMaterial();
    this.add(new Mesh(triangle, this.material));
  }

  draw() {
    gl.renderer.setRenderTarget(null);
    gl.renderer.render(this, orthoCamera);
  }

  resize(width: number, height: number) {
    this.material.resize(width, height);
  }
}