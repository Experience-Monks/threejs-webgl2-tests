const isWebGL2 = require('is-webgl2-context');
const getContext = require('get-canvas-context');
const glExtension = require('gl-extension');
const shaderName = require('glsl-shader-name');
const tokenizer = require('glsl-tokenizer');
const stringifyGLSL = require('glsl-token-string');
const transpileGLSL = require('glsl-100-to-300');

module.exports = function getSafeContext (canvas) {
  const gl = getContext('webgl2', { canvas }) || getContext('webgl', { canvas });

  if (isWebGL2(gl)) {
    console.log('Patching WebGL2 Context...');
    glExtension.patch(gl);

    var glShaderSource = gl.shaderSource;
    gl.shaderSource = function (shader, source) {
      source = transpile(source, isVertex(shader));
      return glShaderSource.call(this, shader, source);
    };
  }

  return gl;

  function isVertex (shader) {
    var type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
    return type === gl.VERTEX_SHADER;
  }

  function transpile (source, isVertex) {
    var tokens = tokenizer(source);
    var name = shaderName(tokens);
    console.warn('Transpiling Shader (%s)', (name || 'no-name'));

    if (isVertex) tokens = transpileGLSL.vertex(tokens);
    else tokens = transpileGLSL.fragment(tokens);
    return stringifyGLSL(tokens);
  }
};
