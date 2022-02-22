import { ShaderMaterial } from 'three';

// @ts-ignore
import vertex from '!raw-loader!glslify-loader!@glsl/materials/default.vert';
// @ts-ignore
import fragment from '!raw-loader!glslify-loader!@glsl/materials/default.frag';

export default class WelcomeMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        map: {
          // @ts-ignore
          type: 't',
          value: null
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
  }
}