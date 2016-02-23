attribute vec4 position;
attribute vec3 offset;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
void main() {
  vec4 tPos = vec4(position.xyz + offset, position.w);
  gl_Position = projectionMatrix * modelViewMatrix * tPos;
}
