import {
  Matrix4,
  PerspectiveCamera,
  ShaderMaterial,
  Vector3
} from 'three';
// @ts-ignore
import vertex from '!raw-loader!glslify-loader!@glsl/materials/textureProjection/textureProjection.vert';
// @ts-ignore
import fragment from '!raw-loader!glslify-loader!@glsl/materials/textureProjection/textureProjection.frag';

/**
 * All components required to implement Texture Projection
 * @link https://codesandbox.io/s/projection-mapping-demo-1-vxg28
 */

export class TextureProjectionMaterial extends ShaderMaterial {
  constructor(parameters?: any) {
    super({
      uniforms: {
        map: {
          // @ts-ignore
          type: 't',
          value: parameters?.map
        },
        viewMatrixCamera: {
          // @ts-ignore
          type: 'm4',
          value: new Matrix4()
        },
        projectionMatrixCamera: {
          // @ts-ignore
          type: 'm4',
          value: new Matrix4()
        },
        projPosition: {
          // @ts-ignore
          type: 'v3',
          value: new Vector3()
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      type: 'effect/TextureProjection'
    });
    if (parameters !== undefined) {
      this.setValues(parameters);
    }
  }

  update(camera: PerspectiveCamera) {
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const viewMatrixCamera = camera.matrixWorldInverse.clone();
    const projectionMatrixCamera = camera.projectionMatrix.clone();
    this.uniforms.viewMatrixCamera.value = viewMatrixCamera;
    this.uniforms.projectionMatrixCamera.value = projectionMatrixCamera;
  }
}