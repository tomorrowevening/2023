uniform sampler2D mainMap;
uniform sampler2D uiMap;
uniform vec2 resolution;
varying vec2 vUv;

#pragma glslify: fxaa = require('../effects/fxaa')

void main() {
  vec4 main = fxaa(mainMap, vUv, resolution);
  vec4 ui = texture2D(uiMap, vUv);
  gl_FragColor = mix(main, ui, ui.a);
}