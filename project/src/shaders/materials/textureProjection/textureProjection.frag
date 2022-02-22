uniform sampler2D map;
uniform vec3 projPosition;
varying vec3 vNormal;
varying vec4 vWorldPosition;
varying vec4 vTexCoords;

void main() {
  vec2 uv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;
  vec4 outColor = texture2D(map, uv);

  // this makes sure we don't render the texture also on the back of the object
  vec3 projectorDirection = normalize(projPosition - vWorldPosition.xyz);
  float dotProduct = dot(vNormal, projectorDirection);
  if (dotProduct < 0.0) {
    discard;
  }

  gl_FragColor = outColor;
}