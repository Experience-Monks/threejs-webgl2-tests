global.THREE = require('three');

const createApp = require('./app');
const createLoop = require('raf-loop');
const glslify = require('glslify');

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

// Simple 3D scene
createScene();

const target1 = createMultiRenderTarget();
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const postMat = new THREE.MeshBasicMaterial({ map: target1.attachments[1] });
const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
const postScene = new THREE.Scene();
postScene.add(postQuad);

const updateSize = () => {
  const dpr = renderer.getPixelRatio();
  const width = Math.floor(window.innerWidth * dpr);
  const height = Math.floor(window.innerHeight * dpr);
  target1.setSize(width, height);
};

window.addEventListener('resize', updateSize);
updateSize();

// Render loop
createLoop(function () {
  updateProjectionMatrix();

  const usePost = true;
  if (usePost) {
    renderer.render(scene, camera, target1);
    renderer.render(postScene, postCamera);
  } else {
    renderer.render(scene, camera);
  }
}).start();

function createMSAATarget () {
  const target = new THREE.WebGLMultisampleRenderTarget();
  setupTarget(target);
  target.samples = /Firefox/i.test(navigator.userAgent) ? 4 : 0;
  return target;
}

function createMultiRenderTarget () {
  const target = new THREE.WebGLMultiRenderTarget();
  setupTarget(target);

  const attachment = target.texture.clone();
  // attachment.width = 256;
  // attachment.height = 256;
  target.attachments.push(attachment);

  return target;
}

function setupTarget (target) {
  target.texture.minFilter = THREE.NearestFilter;
  target.texture.magFilter = THREE.NearestFilter;
  target.texture.format = THREE.RGBAFormat;
  target.texture.generateMipmaps = false;
  target.stencilBuffer = false;
  target.depthBuffer = true;
}

function createScene () {
  // const material = new THREE.MeshBasicMaterial({
  //   color: new THREE.Color('#fff')
  // });

  const material = new THREE.RawShaderMaterial({
    uniforms: {
      map: { type: 't', value: target1 }
    },
    vertexShader: glslify('./shaders/torus-300.vert'),
    fragmentShader: glslify('./shaders/torus-300.frag')
  });

  const geometry = new THREE.TorusKnotGeometry(1, 0.05, 32, 32, 5, 8, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // const material2 = material.clone();
  // material2.color.setStyle('#db2727');
  // const geometry2 = new THREE.TorusKnotGeometry(1, 0.035, 32, 32, 5, 9, 2);
  // const mesh2 = new THREE.Mesh(geometry2, material2);
  // scene.add(mesh2);
}
