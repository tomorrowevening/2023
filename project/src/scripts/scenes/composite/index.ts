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
  constructor() {
    super();
    this.add(new Mesh(triangle, new CompositeMaterial()));
  }

  draw() {
    gl.renderer.setRenderTarget(null);
    gl.renderer.render(this, orthoCamera);
  }
}