// Libs
import { ShaderMaterial } from 'three';
import gsap from 'gsap';

// @ts-ignore
import vertex from '!raw-loader!glslify-loader!@glsl/default.vert';
// @ts-ignore
import fragment from '!raw-loader!glslify-loader!@glsl/materials/welcome/welcome.frag';

export default class WelcomeMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: {
          // @ts-ignore
          type: 'f',
          value: 0
        },
        brightness: {
          // @ts-ignore
          type: 'f',
          value: 1
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      type: 'scenes/welcome/WelcomeMaterial'
    });
  }

  update(delta: number) {
    this.uniforms.time.value += delta;
  }

  show() {
    this.uniforms.brightness.value = 0;
    gsap.to(this.uniforms.brightness, {
      value: 1,
      duration: 1
    });
  }

  hide() {
    gsap.to(this.uniforms.brightness, {
      value: 0,
      duration: 0.5
    });
  }
}