import { Color, ShaderMaterial } from 'three';

// @ts-ignore
import vertex from '!raw-loader!glslify-loader!@glsl/default.vert';
// @ts-ignore
import fragment from '!raw-loader!glslify-loader!@glsl/default.frag';

export default class BasicMaterial extends ShaderMaterial {
  constructor(parameters?: any) {
    super({
      uniforms: {
        diffuse: {
          value: new Color(parameters?.color !== undefined ? parameters?.color : 0xFFFFFF)
        },
        map: {
          value: parameters?.map
        },
        opacity: {
          value: parameters?.opacity ? parameters?.opacity : 1
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      // @ts-ignore
      type: 'materials/BasicMaterial'
    });
    if (parameters !== undefined) {
      this.setValues(parameters);
    }
  }

  // @ts-ignore
  get alpha() {
    return this.uniforms.opacity.value;
  }

  // @ts-ignore
  set alpha(value) {
    this.uniforms.opacity.value = value;
  }
}