import {
  ShaderMaterial,
  Texture,
  Vector2
} from 'three';
import gl from '@ts/models/three';

// @ts-ignore
import vertex from '!raw-loader!glslify-loader!@glsl/default.vert';
// @ts-ignore
import fragment from '!raw-loader!glslify-loader!@glsl/post/composite.frag';

export default class CompositeMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        mainMap: {
          // @ts-ignore
          type: 't',
          value: gl.renderTargets.get('main')
        },
        uiMap: {
          // @ts-ignore
          type: 't',
          value: gl.renderTargets.get('ui')
        },
        resolution: {
          // @ts-ignore
          type: 'v2',
          value: new Vector2(window.innerWidth, window.innerHeight)
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      type: 'post/CompositeMaterial'
    });
  }

  resize(width: number, height: number) {
    this.uniforms.resolution.value.set(width, height);
  }

  set mainMap(value: Texture) {
    this.uniforms.mainMap.value = value;
  }

  set uiMap(value: Texture) {
    this.uniforms.uiMap.value = value;
  }
}