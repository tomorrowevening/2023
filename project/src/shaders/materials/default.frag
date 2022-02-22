uniform sampler2D map;
varying vec2 vUv;

#define ALPHA_TEST 2.0 / 155.0

void main() {
  vec4 img = texture2D(map, vUv);
  vec4 color = vec4(vUv, 0.0, 1.0);
  color = mix(color, img, img.a);
  if (color.a < ALPHA_TEST) discard;
  gl_FragColor = color;
}