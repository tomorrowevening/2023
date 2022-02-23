uniform float time;
uniform float brightness;
varying vec2 vUv;

void main() {
  vec3 col = 0.5 + 0.5 * cos(time + vUv.xyx + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(col * brightness, 1.0);
}