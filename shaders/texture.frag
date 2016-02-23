precision mediump float;

uniform sampler2D map;
varying vec2 vUv;

void main () {
  // assume input is gamma corrected
  gl_FragColor = texture2D(map, vUv);
  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));
}