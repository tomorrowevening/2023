uniform mat4 viewMatrixCamera;
uniform mat4 projectionMatrixCamera;
varying vec4 vWorldPosition;
varying vec3 vNormal;
varying vec4 vTexCoords;

void main() {
  vNormal = mat3(modelMatrix) * normal;
  vWorldPosition = modelMatrix * vec4(position, 1.0);
  vTexCoords = projectionMatrixCamera * viewMatrixCamera * vWorldPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}