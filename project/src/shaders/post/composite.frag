uniform sampler2D mainMap;
uniform sampler2D uiMap;
varying vec2 vUv;

void main() {
  vec4 main = texture2D(mainMap, vUv);
  vec4 ui = texture2D(uiMap, vUv);
  gl_FragColor = mix(main, ui, ui.a);
}