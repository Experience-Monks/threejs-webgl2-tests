global.THREE = require('three.js');
const createApp = require('./app');
const createLoop = require('raf-loop');
const glslify = require('glslify');
const randomSphere = require('gl-vec2/random');

const canvas = document.createElement('canvas');
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// Get a backwards-compatible WebGL2 context
// falls back to regular WebGL1 context
const gl = require('./safe-webgl2-context')(canvas);

// create our app, passing GL context and canvas along!
const {
  renderer,
  camera,
  scene,
  updateProjectionMatrix
} = createApp({ context: gl, canvas, antialias: false });
renderer.setClearColor('#332a33', 1);

setupScene();

function setupScene () {
  const instances = 100;

  const instanceIndexArray = new Float32Array(instances);
  for (let i = 0, c = 0; i < instanceIndexArray.length; i ++) {
    instanceIndexArray[i] = c++;
    if (c > 1000) c = 0;
  }

  const dataGeometry = new THREE.BufferGeometry();
  dataGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(instances * 3), 3, 1));
  dataGeometry.addAttribute('instanceIndex', new THREE.BufferAttribute(instanceIndexArray, 1, 1));

  // seed initial data buffer
  randomizeAttribute(dataGeometry.getAttribute('position'));

  const renderMaterial = new THREE.RawShaderMaterial({
    vertexShader: glslify('./shaders/instance-offset.vert'),
    fragmentShader: glslify('./shaders/color.frag'),
    uniforms: {}
  });
  renderMaterial.index0AttributeName = 'position';

  const dataMaterial = new THREE.RawShaderMaterial({
    vertexShader: glslify('./shaders/motion.vert'),
    fragmentShader: glslify('./shaders/void.frag'),
    uniforms: {
      animation: { type: 'f', value: 0 },
      uPos: { type: 'v3', value: new THREE.Vector3() }
    },
    transformFeedback: {
      varyings: [ 'offset' ]
    }
  });
  dataMaterial.index0AttributeName = 'position';

  const dataPoints = new THREE.Points(dataGeometry, dataMaterial);
  dataPoints.frustumCulled = false;
  const dataScene = new THREE.Scene();
  dataScene.add(dataPoints);

  const cubeGeometry = new THREE.TorusKnotGeometry(10, 1, 16);
  const renderGeometry = new THREE.InstancedBufferGeometry().fromGeometry(cubeGeometry);
  renderGeometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1));
  renderGeometry.removeAttribute('uv')
  renderGeometry.removeAttribute('normal')
  renderGeometry.removeAttribute('color')
  renderGeometry.maxInstancedCount = instances;

  const renderPoints = new THREE.Mesh(renderGeometry, renderMaterial);
  renderPoints.frustumCulled = false;
  scene.add(renderPoints);

  let time = 0;

  // Render loop
  createLoop(function (dt) {
    time += dt / 1000;
    updateProjectionMatrix();

    var position2 = renderGeometry.getAttribute('offset');

    // Animate vertex positions
    dataMaterial.uniforms.animation.value = time;

    // Compute new vertex positions with transform feedback
    renderer.setTransformFeedback([ position2 ]);
    renderer.render(dataScene, camera);
    renderer.setTransformFeedback(null);

    // Render instanced meshes
    renderer.render(scene, camera);
    
  }).start(); 
}


function randomizeAttribute (attribute) {
  const array = attribute.array;
  for (var i = 0; i < attribute.count; i++) {
    const [ x, z ] = randomSphere([], Math.random() * 1000);
    array[i * 3 + 0] = x;
    array[i * 3 + 1] = 0;
    array[i * 3 + 2] = z;
  }
  attribute.needsUpdate = true;
}

