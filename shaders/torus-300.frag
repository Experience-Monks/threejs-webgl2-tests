#version 300 es
#define SHADER_NAME MultiRender

precision mediump float;
precision highp sampler3D;

in vec2 vUv;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 normalColor;

uniform sampler2D tDiffuse;

void main () {
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
  normalColor = vec4(0.0, 0.0, 1.0, 1.0);
}