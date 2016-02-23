#version 300 es

in vec4 position;
in float instanceIndex;
out vec3 offset;

uniform float animation;
uniform vec3 uPos;

void main () {
  // offset.xyz = vec3(instanceIndex * 50.0, 0.0, 0.0);
  offset.xyz = position.xyz;
  offset.y = sin(animation + instanceIndex) * 100.0;
}
