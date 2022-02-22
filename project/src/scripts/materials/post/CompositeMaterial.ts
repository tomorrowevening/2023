import {
  ShaderMaterial,
  Texture
} from 'three';
import gl from '@ts/models/three';

// @ts-ignore
import vertex from '!raw-loader!glslify-loader!@glsl/default.vert';
// @ts-ignore
import fragment from '!raw-loader!glslify-loader!@glsl/post/composite.frag';
import { val } from '@theatre/core';

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
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      type: 'CompositeMaterial'
    });
  }

  set mainMap(value: Texture) {
    this.uniforms.mainMap.value = value;
  }

  set uiMap(value: Texture) {
    this.uniforms.uiMap.value = value;
  }
}